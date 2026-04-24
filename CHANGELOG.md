# Changelog

## [0.4.0](https://github.com/itsmichaelbtw/peersend.io/compare/v0.3.2...v0.4.0) (2026-04-24)


### Features

* **branding:** add SVG logo as favicon and landing page icon ([579f20d](https://github.com/itsmichaelbtw/peersend.io/commit/579f20d59671aa7f2052a223218696a3bb2c35ba))
* **branding:** add wordmark to footer ([df210d4](https://github.com/itsmichaelbtw/peersend.io/commit/df210d4f933429383ad00d63ab4e175ce5c2e357))
* **file-transfer:** integrate abort registry for connection-aware transfers ([5daad31](https://github.com/itsmichaelbtw/peersend.io/commit/5daad316313c4a7df9c52d13b78d9bc86a28c3fe))
* **ui:** file transfer error state, websocket read-only mode, and toasts ([3cf4f37](https://github.com/itsmichaelbtw/peersend.io/commit/3cf4f372357e92e0eb76dbfced4974c0cd0eb0de))
* **web:** move version number into session diagnostics panel ([07912c7](https://github.com/itsmichaelbtw/peersend.io/commit/07912c75e70f2e23245b89d277cd7bc1eb1bad8e))


### Bug Fixes

* **networking:** centralise session teardown and improve disconnect handling ([b29efe4](https://github.com/itsmichaelbtw/peersend.io/commit/b29efe426ee07884a052df72825fd05e2a7ad70b))
* **server:** prevent orphan session on rapid disconnect ([513f310](https://github.com/itsmichaelbtw/peersend.io/commit/513f310fbd88db9e0a1f8c861d343f6c6bb912a9))
* **web:** GitHub URL from package.json, version on session, sonner styling ([b060d81](https://github.com/itsmichaelbtw/peersend.io/commit/b060d8104c33f079fd5a1b0c453136be2f1af4bf))

## [0.3.2](https://github.com/itsmichaelbtw/peersend.io/compare/v0.3.1...v0.3.2) (2026-04-08)


### Bug Fixes

* **web/seo:** remove disallow for /session/ in robots.txt ([99392f1](https://github.com/itsmichaelbtw/peersend.io/commit/99392f110844e6f11b7edef3eb1e768aa1497f59))

## [0.3.1](https://github.com/itsmichaelbtw/peersend.io/compare/v0.3.0...v0.3.1) (2026-04-08)


### Bug Fixes

* **web/seo:** add /session/create to sitemap ([6218865](https://github.com/itsmichaelbtw/peersend.io/commit/6218865ff30fe382308aef53727f03fd40eecfc3))
* **web/seo:** address audit findings ([fdb1241](https://github.com/itsmichaelbtw/peersend.io/commit/fdb12411ce195288f1babf3fc15db68babb6fd32))

## [0.3.0](https://github.com/itsmichaelbtw/peersend.io/compare/v0.2.1...v0.3.0) (2026-04-08)


### Features

* **web/legal:** add Terms of Service and Privacy Policy pages ([9be09b2](https://github.com/itsmichaelbtw/peersend.io/commit/9be09b264d95be83c4e602b444dd904a41bbad63))
* **web/seo:** add comprehensive SEO with react-helmet-async ([829b376](https://github.com/itsmichaelbtw/peersend.io/commit/829b376d50328afb8d75c1823dafbcecec41beac))
* **web:** add landing page ([ba85c7e](https://github.com/itsmichaelbtw/peersend.io/commit/ba85c7e279e41e22f6dc657078cbca9e91447f14))
* **web:** implement landing page with Mantine components ([a394669](https://github.com/itsmichaelbtw/peersend.io/commit/a39466999afe20f584eb1a3bbf6b02cfb6163b38))


### Bug Fixes

* **web/active-session:** decouple column layout and add disconnected state ([86f86b9](https://github.com/itsmichaelbtw/peersend.io/commit/86f86b99d20202fad0baadfa71d364d44ea60964))
* **web/router:** reset scroll to top on page navigation ([c95c56c](https://github.com/itsmichaelbtw/peersend.io/commit/c95c56c935d9a0e67f0f82ec1717aadc1e179c00))
* **web:** add baseUrl to tsconfig.app.json to resolve TS5090 path alias error ([f74fdda](https://github.com/itsmichaelbtw/peersend.io/commit/f74fdda6a2c9a6a6c456446c9e3cb0a3b5fb196c))

## [0.2.1](https://github.com/itsmichaelbtw/peersend.io/compare/v0.2.0...v0.2.1) (2026-03-24)


### Bug Fixes

* **ci:** add always() to deploy-prod to prevent transitive skip ([efc02cd](https://github.com/itsmichaelbtw/peersend.io/commit/efc02cd71e2f33082ca2ca82366cdb412ec63251))
* **ci:** add separate dev/prod dispatch inputs and simplify build-dev condition ([4ac1829](https://github.com/itsmichaelbtw/peersend.io/commit/4ac18297216af90eadc6a75c0ec02362bd3c53fd))
* **ci:** fix deploy-dev transitive skip and gate build-prod on deploy-dev ([704c0f3](https://github.com/itsmichaelbtw/peersend.io/commit/704c0f3d917f4aca289ec88e412ae01fbab30c2d))
* **ci:** match environment casing and remove deploy-dev from prod needs ([0426d6b](https://github.com/itsmichaelbtw/peersend.io/commit/0426d6b48b20dbcf0e47f5230b6a3f641f791ae0))
* **ci:** merge deploy-web and deploy-server into single job for one deployment entry ([5da90b1](https://github.com/itsmichaelbtw/peersend.io/commit/5da90b1168d9196ad36a7660bffac44914e5832b))
* **ci:** pass release version and tag_name through build-prod outputs to deploy-prod ([42030ae](https://github.com/itsmichaelbtw/peersend.io/commit/42030aeba4963e07af54110c1964357e8d403b46))
* **ci:** run dev on workflow_dispatch and deploy prod to main CF branch ([761595f](https://github.com/itsmichaelbtw/peersend.io/commit/761595f25d5df4e9a7154d4f124edbb3ac3ee255))

## [0.2.0](https://github.com/itsmichaelbtw/peersend.io/compare/v0.1.0...v0.2.0) (2026-03-24)


### Features

* active session connection status and details ([8ea4e22](https://github.com/itsmichaelbtw/peersend.io/commit/8ea4e2252991fdc35d77d26b07c888f493460d11))
* add "geist" custom font ([0a7c90f](https://github.com/itsmichaelbtw/peersend.io/commit/0a7c90f24d16814606b4af485c4d5bdabcdeacb3))
* add app logo and back navigation component ([20d0d81](https://github.com/itsmichaelbtw/peersend.io/commit/20d0d81fb009413b4837013cebf642a3520509dd))
* add client list preview to ui ([82ffc70](https://github.com/itsmichaelbtw/peersend.io/commit/82ffc701bb022fe6f79bf2807cb788c5fdec5908))
* add connection state components for direct connection and waiting states ([fb7f73e](https://github.com/itsmichaelbtw/peersend.io/commit/fb7f73ee020b7969655c069289471b9f340095c6))
* add connection status components including `ClientIndicator`, `Diagnostics`, and `InfoStatistic` ([4e7b2a6](https://github.com/itsmichaelbtw/peersend.io/commit/4e7b2a643b8107dc5814784c7395dcbb1485b4e2))
* add create and join session views ([adcfb1c](https://github.com/itsmichaelbtw/peersend.io/commit/adcfb1c60ad0d9ac7b31c0da169a2c5f549d8d14))
* add docker support with dockerfile and docker-compose for development ([613f467](https://github.com/itsmichaelbtw/peersend.io/commit/613f467359824c123e50a8cce2014906dc376cb6))
* add font styles and remove unused react.svg asset ([202f2cc](https://github.com/itsmichaelbtw/peersend.io/commit/202f2cc3c4b3d5b788cd9c8d8242f48afdb89b0f))
* add host and connection badges to session header ([290e8ec](https://github.com/itsmichaelbtw/peersend.io/commit/290e8ec1fda40a0c55c73c5e5666c2d5486089fc))
* add issue templates for bug reports, CI/CD requests, feature requests, and refactor suggestions ([68a7cd4](https://github.com/itsmichaelbtw/peersend.io/commit/68a7cd4140575364950efeda22753fbd14123972))
* add logging for session and client lifecycle events ([6f58275](https://github.com/itsmichaelbtw/peersend.io/commit/6f582759962c8253021760b6fc500c1f7f1fe413))
* add main and session layout components ([e07f4b5](https://github.com/itsmichaelbtw/peersend.io/commit/e07f4b5ef69fbcdd73aab0a2289ee8f2cebb0840))
* add main header and session header components ([ca904ed](https://github.com/itsmichaelbtw/peersend.io/commit/ca904ed7a2e75c7e961f5d7a8a7ec74472843bd7))
* add mantine providers ([67e3f53](https://github.com/itsmichaelbtw/peersend.io/commit/67e3f53ef0243bf5b21a3ea14a7e245ad96f94da))
* add session card and container components, update create and join session views ([dc3fe58](https://github.com/itsmichaelbtw/peersend.io/commit/dc3fe5842ca4bafa78f5e174eded93df6e1d804a))
* add toast notifications for websocket errors in session layout ([d78a29b](https://github.com/itsmichaelbtw/peersend.io/commit/d78a29bd80cd2bc76427021250f1b1d0199d5f62))
* add utility functions for websocket handling and state updates ([7341ed9](https://github.com/itsmichaelbtw/peersend.io/commit/7341ed9d5853bec79efad2920650273e6c755d02))
* add vue route guards for session ([50f6ded](https://github.com/itsmichaelbtw/peersend.io/commit/50f6dede876b40c96969a80bca12493dbee0e54b))
* add ws message utility function ([d26706c](https://github.com/itsmichaelbtw/peersend.io/commit/d26706cd4c958bb8b4a40e29b7070359bb5cfa8c))
* added title to error json ([cdfe2be](https://github.com/itsmichaelbtw/peersend.io/commit/cdfe2bee59f691e535628c2606a6be229f3b70ad))
* added version and environment to server config ([bc82a8e](https://github.com/itsmichaelbtw/peersend.io/commit/bc82a8e2ec8eaf2fbcab03086c51da87eb5a5d26))
* allow certain log levels to be set ([a84ac75](https://github.com/itsmichaelbtw/peersend.io/commit/a84ac75c8e18639815107859b7c5a6240a81e218))
* browser download for received files ([03d49e5](https://github.com/itsmichaelbtw/peersend.io/commit/03d49e5f647544ffc60aa9fb5d56b9292526cd1b))
* connection status and technical details for active session ([c98e555](https://github.com/itsmichaelbtw/peersend.io/commit/c98e555b5ae06dd9558ed7d8a0bb1a9148228ec5))
* constants can now be set via vite `import.meta.env` ([65bff83](https://github.com/itsmichaelbtw/peersend.io/commit/65bff83b9b2f46abb945461548d1ca3ba702fb61))
* copy session code to clipboard ([cd2e35c](https://github.com/itsmichaelbtw/peersend.io/commit/cd2e35c72292336edd05c9d7dfbfc3eb31380862))
* custom client side logger ([4471582](https://github.com/itsmichaelbtw/peersend.io/commit/44715828583207805fefa9df194e042d47fd25cd))
* custom networking library including ws and wrtc ([be251a6](https://github.com/itsmichaelbtw/peersend.io/commit/be251a6764ec00aaa8be2cc2a41040c5eb23b7e1))
* enhance session management and client connection handling ([835beb5](https://github.com/itsmichaelbtw/peersend.io/commit/835beb5ba52b2e1fd4653f23398a821ce5004c30))
* enhance session management with websocket integration ([fd3c9d4](https://github.com/itsmichaelbtw/peersend.io/commit/fd3c9d49d87b82a4e1f623dd728a8f9f6e8bd42a))
* file transfer functionality for receiving files ([253d66d](https://github.com/itsmichaelbtw/peersend.io/commit/253d66dadcba3795ce3df01e5a2a6131b1bc4aa8))
* implement abort registry for managing abort signals in data channels and websockets ([a8c7f6f](https://github.com/itsmichaelbtw/peersend.io/commit/a8c7f6f520e6ec9736689bd38cea19d0b5596b69))
* implement app state management with session, webrtc, and websocket states ([016f0c1](https://github.com/itsmichaelbtw/peersend.io/commit/016f0c127f93b796be6acb473480bbd9198f4eac))
* implement custom hooks for app state, compatibility, class names, and time distance ([80f40f6](https://github.com/itsmichaelbtw/peersend.io/commit/80f40f6cd5213555b7fa5eda91fa2e8e7a9cec35))
* implement file transfer components including `FileUpload`, `FileTable`, and related utilities; add connection upgrade modal and collaboration logic ([dd46ce8](https://github.com/itsmichaelbtw/peersend.io/commit/dd46ce8098ba4f55a6241df96f894eaf0935c612))
* implement file transfer context and reducer with dispatch functionality ([b731354](https://github.com/itsmichaelbtw/peersend.io/commit/b731354a5e66521a5a451680882730b9d55cdc94))
* implement main layout, session layout, compatibility view, active session view, create session view, and join session view with routing ([2c37829](https://github.com/itsmichaelbtw/peersend.io/commit/2c378296d825110992248c9c14825a41b74210a0))
* implement session creation and full session handling ([e36baf0](https://github.com/itsmichaelbtw/peersend.io/commit/e36baf07a9152d00ea37b56c15e82ffb6bbbcc4f))
* implement websocket server and client with session management ([d00a4df](https://github.com/itsmichaelbtw/peersend.io/commit/d00a4dfb9eec0ac1f83ba0563050ac92ae4b3a1e))
* implement ws client-side state management and UI ([5b450e3](https://github.com/itsmichaelbtw/peersend.io/commit/5b450e3b8b9b1b6b6538c06986b3ba8002a37b82))
* improved internal application state to make it easier to manage websocket and webrtc state separately ([c2d28d3](https://github.com/itsmichaelbtw/peersend.io/commit/c2d28d3bd40d2dbe8e6be2a344e969127505b309))
* improved server side logging ([e141c2a](https://github.com/itsmichaelbtw/peersend.io/commit/e141c2ac9a9ce6f2fef83e81eb60e54132581726))
* initialise vue 3 project with vite and typescript setup, remove alpine.js ([5791783](https://github.com/itsmichaelbtw/peersend.io/commit/5791783b760854fef536fafbc78e3210fea32a97))
* latency checker abstraction for webrtc and websocket ([87eb11d](https://github.com/itsmichaelbtw/peersend.io/commit/87eb11df002350d7f9155eeac8213a6dd3ba73f1))
* latency monitoring via webrtc ([a9b9db8](https://github.com/itsmichaelbtw/peersend.io/commit/a9b9db8fcb912185d2f20a6a34d66105421d6850))
* new copy to clipboard component and composable ([c770ef6](https://github.com/itsmichaelbtw/peersend.io/commit/c770ef6e4677ce7513f9f175f249ce1798a5258c))
* new file transfer library ([0c51e72](https://github.com/itsmichaelbtw/peersend.io/commit/0c51e7251ecdb86abc85925578f51014d571feb2))
* refactor file transfer components and implement file storage management ([29fc138](https://github.com/itsmichaelbtw/peersend.io/commit/29fc13837dbc8917d6b03f82f941ac13913eecd4))
* server now sends encryption and webrtc status ([f9aa158](https://github.com/itsmichaelbtw/peersend.io/commit/f9aa158189baffedfc06116d68249afebc2b00c3))
* **server:** implement ping-pong latency echo functionality ([30bac44](https://github.com/itsmichaelbtw/peersend.io/commit/30bac4426d3fce16dddbef24a07410cbb84b34a4))
* session codes are now prefixed with `X-` ([c895f65](https://github.com/itsmichaelbtw/peersend.io/commit/c895f65d16580682cb0bf60f6573fc55ac1ff4ab))
* set primary theme for primevue ([867f26a](https://github.com/itsmichaelbtw/peersend.io/commit/867f26ad790380278e134bf5a8b3db36ba1edbd9))
* soft lock application if webrtc isn't defined for current browser ([8e5f34a](https://github.com/itsmichaelbtw/peersend.io/commit/8e5f34acde1116af9d07aa7727ab1047203f3c3b))
* supporting web views for webrtc connection ([dd354d8](https://github.com/itsmichaelbtw/peersend.io/commit/dd354d860e5bafffa2a71a4f29e13e80dda58f11))
* update session types and add websocket state management ([d7510ad](https://github.com/itsmichaelbtw/peersend.io/commit/d7510ad6def80f4ffde5e5f8f652b88036fd528e))
* update websocket server to handle connections and sessions more efficiently ([9feebc4](https://github.com/itsmichaelbtw/peersend.io/commit/9feebc4558131d25e1d07ab5c20f1e9688ba9b94))
* updates to file-transfer including new file transport composition ([bbb78bf](https://github.com/itsmichaelbtw/peersend.io/commit/bbb78bf44fdbcd1baab220d387404583f3b7cd46))
* zod and primevue forms setup ([4f76f6e](https://github.com/itsmichaelbtw/peersend.io/commit/4f76f6e481e262516f79ae71b9d6e23ca5e77e2a))


### Bug Fixes

* add mutex to client to ensure safe writes in goroutines ([a4db76b](https://github.com/itsmichaelbtw/peersend.io/commit/a4db76b97bcb60c7b026eb00bd1c5b2e1ccea463))
* add route for active session and update button to use RouterLink ([4b72523](https://github.com/itsmichaelbtw/peersend.io/commit/4b7252318630f3d9c84610ab71954f936a59dd32))
* bind server to localhost instead of all interfaces ([05e1ab3](https://github.com/itsmichaelbtw/peersend.io/commit/05e1ab33174105ec4ae86201d00985fafb5d1973))
* broadcasting to session accessing session clients outside of a mutex lock ([e269452](https://github.com/itsmichaelbtw/peersend.io/commit/e2694522aec748126ebc30d94b5a91e986ae650c))
* bytes not being removed from files causing transfer issues ([3cf3368](https://github.com/itsmichaelbtw/peersend.io/commit/3cf336890410c8e088db141de0868b264f8dc05d))
* change some info logs to debug ([5e44fe3](https://github.com/itsmichaelbtw/peersend.io/commit/5e44fe3d0069107acae11f766be798f8f7865957))
* **ci:** create server directory before rsync ([694f8d0](https://github.com/itsmichaelbtw/peersend.io/commit/694f8d054562bfccff0c4faf1af45ee9e5612801))
* **ci:** use heredoc to correctly export env vars to remote deploy script ([83c6c3d](https://github.com/itsmichaelbtw/peersend.io/commit/83c6c3d1c89951d0e6a5c6417de41df167128821))
* **ci:** use rsync --mkpath to create server directory automatically ([afe9800](https://github.com/itsmichaelbtw/peersend.io/commit/afe9800e52cca7b58ebc486236bcc67460d37791))
* cleaned up and revised state interfaces and types ([34c84b2](https://github.com/itsmichaelbtw/peersend.io/commit/34c84b226b077d645efc65b7ede515a3b3c2d8cf))
* connection force closed as ctx was always done ([e8c317f](https://github.com/itsmichaelbtw/peersend.io/commit/e8c317ffb84767bd948daa43bf8baef535281987))
* corrected import paths and tsconfig projects for test cases ([e1384c7](https://github.com/itsmichaelbtw/peersend.io/commit/e1384c756f6014724982695a9b094ac89beddfa6))
* defined custom structs for certain payload activity ([2acf91b](https://github.com/itsmichaelbtw/peersend.io/commit/2acf91b84af9fda6d0f266396024ff14cf213c7c))
* **deploy:** split nginx confs per environment and fix http2 directive ([c4f6d45](https://github.com/itsmichaelbtw/peersend.io/commit/c4f6d45868f6f6164c0626d9fde0808f792e19ec))
* **deploy:** write nginx conf to host mount path instead of docker cp ([e0bd7cd](https://github.com/itsmichaelbtw/peersend.io/commit/e0bd7cdb7ad12f25c1b7f5d754e6a5b3be58ba49))
* double disconnect call when `onError` is called for socket state ([dfd108a](https://github.com/itsmichaelbtw/peersend.io/commit/dfd108a9c9226d0c224c69f92869964ee2bd75c9))
* **e2e:** strip trailing slash from PLAYWRIGHT_BASE_URL ([f55a97a](https://github.com/itsmichaelbtw/peersend.io/commit/f55a97afe7ccaf171ac0a990b16a25a58de399f1))
* **e2e:** update hardcoded BASE_URL and SERVER_URL to test ports 3501/8081 ([beeba88](https://github.com/itsmichaelbtw/peersend.io/commit/beeba88a55de3c7e2e7e2b69fcca06822f7e0ba7))
* error message types are now capitalised ([eb67db6](https://github.com/itsmichaelbtw/peersend.io/commit/eb67db681c5939f2f3f0ef044bd87d571ef1155e))
* eslint and type errors ([5b6ef75](https://github.com/itsmichaelbtw/peersend.io/commit/5b6ef75a279e460bd2e0847aedfd855a3a257b6a))
* **file-transfer:** disable removal of in-transit files ([6088267](https://github.com/itsmichaelbtw/peersend.io/commit/60882673794403b2b9e2e4615e74593b3179daf9)), closes [#36](https://github.com/itsmichaelbtw/peersend.io/issues/36)
* firefox issues with buffers and improved error handling ([b9ef1aa](https://github.com/itsmichaelbtw/peersend.io/commit/b9ef1aafced5b03e0a11755af87ae4a7f287b50f))
* handle json marshal error by returning byte error instead ([6bf3747](https://github.com/itsmichaelbtw/peersend.io/commit/6bf37472565c846421b94ff34a989a55b9627792))
* http query extraction returns value instead of pointer ([0e87708](https://github.com/itsmichaelbtw/peersend.io/commit/0e877080e2c58202e4d743ce339f719b6c5c5dda))
* improve error message formatting in session layout ([2b2dd9b](https://github.com/itsmichaelbtw/peersend.io/commit/2b2dd9b7397e809e3a5abaf82bc4e5155d603ebe))
* improved error handling on websocket connections ([418b3f8](https://github.com/itsmichaelbtw/peersend.io/commit/418b3f8c49cf6d650b23b29a168c43ff30a712d2))
* improved hover styles for copy code ([a698f4a](https://github.com/itsmichaelbtw/peersend.io/commit/a698f4a156dd53c49481aa2008941c98bdb26ac6))
* improved main.go when setting up the http server ([ea837cf](https://github.com/itsmichaelbtw/peersend.io/commit/ea837cf6823455d38dea177bb17b0eebd7ad212d))
* improved ws upgrade errors for http requests ([c1e010a](https://github.com/itsmichaelbtw/peersend.io/commit/c1e010a4c0362164c66301926d55d5fb9bf11049))
* incorrect `v-bind` for form submission ([abb45f7](https://github.com/itsmichaelbtw/peersend.io/commit/abb45f7a00a9555cd921256e35830050bcab7663))
* incorrect validation when joining a room ([dd3b6af](https://github.com/itsmichaelbtw/peersend.io/commit/dd3b6afde12dcff127abf601f3e1a748eb6e3828))
* middle align header horizontally ([a009617](https://github.com/itsmichaelbtw/peersend.io/commit/a00961790ef712e79678553e88f1aedbb90adeb5))
* moved host setting to repository level ([a78d445](https://github.com/itsmichaelbtw/peersend.io/commit/a78d44524086c474812beadedf9d91198563172e))
* **nginx:** use variable upstreams to prevent crash on missing service ([81ff295](https://github.com/itsmichaelbtw/peersend.io/commit/81ff29577b5a6cefc5f868b7235d26a116d6612c))
* npm install command in ci linter ([7ef6ec0](https://github.com/itsmichaelbtw/peersend.io/commit/7ef6ec0b9bf7c7373baed7826e5e5f7ee8bddc16))
* pancis inside of exchange logic cause server to crash ([eb8d418](https://github.com/itsmichaelbtw/peersend.io/commit/eb8d418066287cb6012346021d669d69693d10e8))
* pass docker network domain instead of fixed ip address ([102448c](https://github.com/itsmichaelbtw/peersend.io/commit/102448c2338578ec5ccde97ea0064a94602ef94b))
* populate initial client connection with current client ([aa547f4](https://github.com/itsmichaelbtw/peersend.io/commit/aa547f437fc2a0787cc49409f639880b61585b20))
* progress update getting stuck after multple files ([94eb74f](https://github.com/itsmichaelbtw/peersend.io/commit/94eb74f4413d34108438fba03f8d4b34a316d1bd))
* proper memoization on file gruops ([a109977](https://github.com/itsmichaelbtw/peersend.io/commit/a10997744346c0e7c52645a1bb1ce7bded641664))
* remove broadcaster from session ([89593f4](https://github.com/itsmichaelbtw/peersend.io/commit/89593f42d844edf92690367acb6558e18659bf8b))
* send unhandled message to other client rather than a broadcast ([1be758d](https://github.com/itsmichaelbtw/peersend.io/commit/1be758d55917a38e45cea1c311f7cdd9d5e78d64))
* separated transfer host errors for ui clarity ([4956e17](https://github.com/itsmichaelbtw/peersend.io/commit/4956e17715446877faa20647886cadbb32957478))
* server now sends the connection type to the client ([9fd53af](https://github.com/itsmichaelbtw/peersend.io/commit/9fd53af94c5efead22c00180a4c7b87f35d1c2ee))
* service layer accessing data outside of a mutex lock ([72cd59f](https://github.com/itsmichaelbtw/peersend.io/commit/72cd59f1f13f89184e2a085a57292ced2aa8e582))
* session layout padding breakpoints ([bfb81e7](https://github.com/itsmichaelbtw/peersend.io/commit/bfb81e79a0b460d6728962a7c0f73c7eb3023161))
* set app env in docker compose for server ([d787ca0](https://github.com/itsmichaelbtw/peersend.io/commit/d787ca0e1db6bc82138271e9e8fe0e28981467c2))
* set warnings to 5 when running eslint ([a6bb77e](https://github.com/itsmichaelbtw/peersend.io/commit/a6bb77ef5b22cf43d301acf328da2d45d6140d19))
* type checks ([291c998](https://github.com/itsmichaelbtw/peersend.io/commit/291c998efa1c2368aa9a4be7e753c6b15777f930))
* update event handler to use byte slice for incoming data and add logging ([9785738](https://github.com/itsmichaelbtw/peersend.io/commit/9785738a916ad2a9a78e4fb1a0492281287313dd))
* update golang dockerfile and docker compose to build new project structure ([877a651](https://github.com/itsmichaelbtw/peersend.io/commit/877a65168b5ddd35beb7126c332a184a327b05d2))
* update session code param to match server ([f19555f](https://github.com/itsmichaelbtw/peersend.io/commit/f19555fea1409d1c052c5960fda1a5a8c74660fd))
* updated text colors and icon sizes ([9c1e5ee](https://github.com/itsmichaelbtw/peersend.io/commit/9c1e5eefda550958eadcbc62f391681f0dcfe50e))
* use proper unicode for review template ([2752102](https://github.com/itsmichaelbtw/peersend.io/commit/2752102cb00184b1b5ac9115d610e4efdbaf61cb))
* websocket and webrtc clients instances not being set to local vars ([37831ee](https://github.com/itsmichaelbtw/peersend.io/commit/37831eef8384d587bd55b7ba19a0689232d2e113))
* zod / primevue form not showing error messages ([4528c0b](https://github.com/itsmichaelbtw/peersend.io/commit/4528c0b781f790e801c4f0a55a37b1da12ad2f80))
