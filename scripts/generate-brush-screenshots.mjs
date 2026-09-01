import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import {
	access,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	stat,
	writeFile
} from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join, normalize, resolve, sep } from 'node:path';
import process from 'node:process';

const projectRoot = resolve( import.meta.dirname, '..' );
const args = process.argv.slice( 2 );

function option( name ) {

	const index = args.indexOf( name );
	return index === -1 ? undefined : args[ index + 1 ];

}

const outputDirectory = resolve( projectRoot,
	option( '--output' ) ?? 'Support/Screenshots/brushes-postfx-disabled' );
const fixtureDirectory = option( '--fixtures' ) ? resolve( option( '--fixtures' ) ) : undefined;
const brushAssetsDirectory = resolve(
	option( '--assets' ) ?? join( projectRoot, 'brushes' )
);
const brushFilter = option( '--brush' )?.toLowerCase();
const headed = args.includes( '--headed' );

function parseBrushDirectory( name ) {

	const match = /^(.*)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec( name );
	return match ? { durableName: match[ 1 ], brushGuid: match[ 2 ].toLowerCase() } : undefined;

}

async function createManifest() {

	const assetEntries = ( await readdir( brushAssetsDirectory, { withFileTypes: true } ) )
		.filter( entry => entry.isDirectory() )
		.map( entry => parseBrushDirectory( entry.name ) )
		.filter( Boolean );
	let entries = assetEntries;
	if ( fixtureDirectory ) {

		const fixtureNames = ( await readdir( fixtureDirectory ) ).filter( name => name.endsWith( '.mesh.json' ) );
		entries = [];
		for ( const name of fixtureNames ) {

			const fixture = JSON.parse( await readFile( join( fixtureDirectory, name ), 'utf8' ) );
			entries.push( {
				durableName: fixture.durableName,
				brushGuid: fixture.brushGuid.toLowerCase()
			} );

		}

	}
	if ( brushFilter ) {

		const exactEntries = entries.filter( entry =>
			entry.durableName.toLowerCase() === brushFilter || entry.brushGuid === brushFilter );
		entries = exactEntries.length > 0 ? exactEntries : entries.filter( entry =>
			entry.durableName.toLowerCase().includes( brushFilter ) );

	}
	return entries.sort( ( left, right ) => left.durableName.localeCompare( right.durableName ) );

}

function run( executable, childArgs ) {

	return new Promise( ( resolvePromise, reject ) => {

		const child = spawn( executable, childArgs, { cwd: projectRoot, windowsHide: true } );
		let output = '';
		for ( const stream of [ child.stdout, child.stderr ] ) stream.on( 'data', chunk => {

			output = ( output + chunk ).slice( -65536 );

		} );
		child.on( 'error', reject );
		child.on( 'exit', code => code === 0
			? resolvePromise()
			: reject( new Error( `Command exited with ${code}:\n${output}` ) ) );

	} );

}

async function findChrome() {

	const candidates = process.platform === 'win32' ? [
		join( process.env.PROGRAMFILES ?? '', 'Google/Chrome/Application/chrome.exe' ),
		join( process.env[ 'PROGRAMFILES(X86)' ] ?? '', 'Google/Chrome/Application/chrome.exe' ),
		join( process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe' )
	] : process.platform === 'darwin' ? [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
	] : [ '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium' ];
	for ( const candidate of candidates ) {

		try { await access( candidate ); return candidate; } catch {}

	}
	throw new Error( 'Google Chrome was not found in a standard installation location.' );

}

const mimeTypes = {
	'.css': 'text/css', '.glsl': 'text/plain', '.html': 'text/html', '.js': 'text/javascript',
	'.json': 'application/json', '.png': 'image/png'
};

function safeFile( root, relativePath ) {

	const file = resolve( root, `.${sep}${normalize( relativePath )}` );
	return file === root || file.startsWith( `${root}${sep}` ) ? file : undefined;

}

async function main() {

	const manifest = await createManifest();
	if ( manifest.length === 0 ) throw new Error( 'No matching local brush assets were found.' );
	await mkdir( outputDirectory, { recursive: true } );
	const temporaryRoot = await mkdtemp( join( tmpdir(), 'three-tiltloader-screenshots-' ) );
	const siteRoot = join( temporaryRoot, 'site' );
	const profileRoot = join( temporaryRoot, 'chrome-profile' );
	await mkdir( profileRoot );
	try {

		await run( process.execPath, [
			join( projectRoot, 'node_modules/parcel/lib/bin.js' ), 'build', '--target', 'brushScreenshots',
			'--dist-dir', siteRoot, '--public-url', '/', '--no-cache'
		] );
		await writeFile( join( siteRoot, 'brush-manifest.json' ), JSON.stringify( manifest ), 'utf8' );

		let finish;
		const finished = new Promise( ( resolvePromise, reject ) => { finish = { resolve: resolvePromise, reject }; } );
		const brushesRoot = brushAssetsDirectory;
		const server = createServer( async ( request, response ) => {

			try {

				const url = new URL( request.url, 'http://127.0.0.1' );
				if ( request.method === 'POST' && url.pathname === '/capture' ) {

					const filename = basename( url.searchParams.get( 'filename' ) ?? '' );
					if ( !filename.endsWith( '.png' ) ) throw new Error( 'Invalid screenshot filename.' );
					const chunks = [];
					for await ( const chunk of request ) chunks.push( chunk );
					await writeFile( join( outputDirectory, filename ), Buffer.concat( chunks ) );
					response.writeHead( 204 ).end();
					return;

				}
				if ( request.method === 'POST' && ( url.pathname === '/done' || url.pathname === '/error' ) ) {

					const chunks = [];
					for await ( const chunk of request ) chunks.push( chunk );
					const result = JSON.parse( Buffer.concat( chunks ).toString( 'utf8' ) );
					response.writeHead( 204 ).end();
					if ( url.pathname === '/error' ) finish.reject( new Error( result.error ) );
					else finish.resolve( result );
					return;

				}

				let root = siteRoot;
				let relativePath = url.pathname === '/' ? 'index.html' : url.pathname.slice( 1 );
				if ( relativePath.startsWith( 'brushes/' ) ) {

					root = brushesRoot;
					relativePath = relativePath.slice( 'brushes/'.length );

				}
				const file = safeFile( root, decodeURIComponent( relativePath ) );
				if ( !file || !( await stat( file ) ).isFile() ) throw new Error( 'Not found' );
				response.writeHead( 200, { 'Content-Type': mimeTypes[ extname( file ) ] ?? 'application/octet-stream' } );
				createReadStream( file ).pipe( response );

			} catch {

				response.writeHead( 404 ).end();

			}

		} );
		await new Promise( resolvePromise => server.listen( 0, '127.0.0.1', resolvePromise ) );
		const port = server.address().port;
		const chrome = await findChrome();
		const chromeArgs = [
			`--user-data-dir=${profileRoot}`,
			'--no-first-run', '--disable-default-apps', '--disable-extensions',
			...( headed ? [] : [ '--headless=new' ] ),
			`http://127.0.0.1:${port}/`
		];
		const browser = spawn( chrome, chromeArgs, { stdio: 'ignore', windowsHide: !headed } );
		const timeout = setTimeout( () => finish.reject(
			new Error( 'Brush screenshot capture timed out after 10 minutes.' )
		), 10 * 60 * 1000 );
		browser.once( 'error', error => finish.reject( error ) );
		browser.once( 'exit', code => finish.reject(
			new Error( `Chrome exited before capture completed (exit code ${code}).` )
		) );
		try {

			const result = await finished;
			console.log( `Captured ${result.captured} brush screenshots in ${outputDirectory}` );

		} finally {

			clearTimeout( timeout );
			browser.kill();
			await new Promise( resolvePromise => server.close( resolvePromise ) );

		}

	} finally {

		const resolvedTemporaryRoot = resolve( temporaryRoot );
		if ( resolvedTemporaryRoot.startsWith( `${resolve( tmpdir() )}${sep}` ) ) {

			await rm( resolvedTemporaryRoot, { recursive: true, force: true, maxRetries: 3 } );

		}

	}

}

await main();
