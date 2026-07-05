# TODO

calc 앱 되살리기 이후 이어갈 작업 목록입니다.

## 1. 한글 변수 지원 ✅ (완료)

- `src/helpers/identifiers.ts`에서 비ASCII 식별자를 안정적 ASCII 별칭
  (`_kv0`, `_kv1` ...)으로 치환한 뒤 평가. 결과는 숫자/단위라 역매핑 불필요.
- 한글 변수(`월급 = 3000000`), 참조, 한글 함수 정의(`제곱(x) = x^2`)까지 지원.
- 비수식 한글 줄은 기존처럼 빈 출력으로 처리.

## 2. 실시간 환율

- **현재 상태**: `src/helpers/currency.ts`의 `USD_RATES`가 고정 스냅샷 값
  (오프라인 동작 우선).
- **방향**: 환율 API에서 값을 받아 `registerCurrencies`에 주입.
  - 앱 시작 시 1회 fetch → 실패 시 고정값으로 폴백.
  - 마지막 조회 값을 localStorage에 캐시(오프라인/레이트리밋 대비).
  - CORS 및 Vercel 배포 환경에서의 호출 가능 여부 확인 필요.
  - 조회 시각을 UI에 표시하면 신뢰도 향상.

## 3. 번들 최적화 ✅ (완료)

- mathjs(평가 모듈)를 `hooks/useEditor`에서 동적 import해 초기 번들에서 분리.
  앱 셸이 먼저 뜨고 mathjs는 마운트 직후 비동기 로드됩니다.
- React를 별도 vendor 청크로 분리(`vite.config.js`).
- **결과**: 초기 차단 로드 gzip 약 263 kB → 약 76 kB. mathjs(gzip ~190 kB)는
  지연 로드.
- 추가 여지: prismjs도 지연 로드하거나, mathjs 함수 서브셋만 import해 총량
  자체를 더 줄이는 방향.

## 4. 배포 ✅ (완료)

- GitHub Pages + GitHub Actions로 배포(`.github/workflows/deploy.yml`).
  `main`에 푸시되면 자동 빌드/배포.
- 프로젝트 페이지 경로(`/calc/`)에 맞춰 `vite.config.js`의 `base`를 빌드
  시에만 `/calc/`로 설정(dev는 `/`).
- **최초 1회 수동 설정 필요**: 저장소 Settings → Pages → Build and
  deployment → Source를 **GitHub Actions**로 지정.
- 공개 주소: `https://cbcruk.github.io/calc/`
- 커스텀 도메인을 붙이면 `base`를 `/`로 되돌려야 함.

## 기타 아이디어

- 결과 포맷 개선: 통화별 소수 자릿수(예: KRW 0자리, USD 2자리) 구분 표시.
- 모바일 레이아웃(좁은 화면에서 입력/결과 세로 배치).
- 예제/도움말 패널로 문법(변수, `of`, 단위, 통화, `lineN`) 안내.
