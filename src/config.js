export const GAME_VERSION='V1';
export const GAME_NAME='Tekaym Online';
export const SERVER_URL='wss://YOUR-TEKAYM-BELMO.onbelmo.uk/ws';
export const HTTP_SERVER_URL=SERVER_URL.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\/ws$/,'');
export const ASSETS={
  prisonStarter:'https://cdn.3dassets.dev/assets/25718/v1/model.glb',
  zombieStarter:'https://cdn.3dassets.dev/assets/12020/v1/model.glb',
  knife:'https://cdn.3dassets.dev/assets/27319/v1/model.glb'
};
export const WORLD={maxPlayers:16,cellAreas:4,cellsPerArea:16,cellWidth:4,cellDepth:5,corridorWidth:4,prisonScale:1,zombieMinDistanceFromCells:5};
