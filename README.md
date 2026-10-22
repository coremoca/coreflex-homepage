# 코어플렉스 홈페이지 수정 안내

**수정은 `src`에서 합니다. `dist`는 자동 생성 결과이므로 직접 고치지 않습니다.**

## 실행

Node.js가 설치된 PC에서 `start-local.cmd`를 실행하거나 `npm run dev`를 실행합니다.
주소는 http://localhost:4175/ 입니다. `src`를 저장하면 재생성 후 브라우저가 갱신됩니다. 별도 패키지 설치는 필요 없습니다.

- `npm run build`: 배포용 `dist` 생성
- `npm run check`: 내부 링크·이미지·폰트 확인

## 무엇을 어디서 수정하나요?

| 수정할 내용                    | 파일                                                   |
| ------------------------------ | ------------------------------------------------------ |
| 회사별 실적·고객사 추가        | `src/data/client-projects.json`                        |
| 연도별 실적 추가               | `src/data/yearly-projects.json`                        |
| 고객사 로고 추가               | `src/data/clients.json` + `src/assets/images/clients/` |
| 첫 화면                        | `src/pages/index.html`                                 |
| 회사소개·경쟁력                | `src/pages/company.html`                               |
| 금융솔루션                     | `src/pages/financial-solutions.html`                   |
| 회사별 실적의 제목·배치        | `src/pages/client-projects.html`                       |
| 연도별 실적의 제목·배치        | `src/pages/yearly-projects.html`                       |
| Medallia 설명·제품 이미지·영상 | `src/pages/customer-experience.html`                   |
| 채용분야·지원방법·복지         | `src/pages/careers.html`                               |
| 문의 문구·연락처               | `src/pages/contact.html`                               |
| 전체 페이지 상단 메뉴          | `src/components/header.html`                           |
| 전체 페이지 하단 주소·연락처   | `src/components/footer.html`                           |
| 공통 글꼴·색상·글자 크기       | `src/styles/theme.css`                                 |
| 공통 배치·메인 구역            | `src/styles/layout.css`                                |
| 내부 페이지 상세 배치          | `src/styles/pages.css`                                 |

## 실적 한 줄 추가

회사별은 `client-projects.json`에서 해당 회사의 `projects`에 한국어·영어 문구 객체를 추가합니다.
새 회사는 `items` 배열에 다음 객체 하나를 추가합니다. `region`은 국내 `domestic`, 해외 `global`입니다.

```json
{
  "name": "고객사 이름",
  "nameEn": "Client name",
  "region": "domestic",
  "projects": [
    { "ko": "기존 구축 (2025)", "en": "Existing project (2025)" },
    { "ko": "새 프로젝트 구축 (2026)", "en": "New project (2026)" }
  ]
}
```

연도별은 `yearly-projects.json`의 해당 연도 `projects`에 추가합니다. 새 연도는 다음 객체를 `items`에 추가합니다.

```json
{
  "year": 2027,
  "projects": [
    {
      "ko": "고객사 새 프로젝트 구축",
      "en": "Client: new project implementation"
    }
  ]
}
```

연도는 최신순으로 정렬됩니다. 고객사 건수·지역 필터·연도 탐색·그래프·메인 최근 실적은 자동 반영됩니다.
**회사별과 연도별은 별도 분류이므로 양쪽에 보일 실적은 두 파일에 각각 추가합니다.**

## 로고 추가

1. 이미지를 `src/assets/images/clients/`에 넣습니다.
2. `clients.json`의 `items`에 추가합니다. `width`, `height`는 원본 크기입니다.

```json
{
  "name": "새 고객사",
  "nameEn": "New client",
  "region": "domestic",
  "image": "assets/images/clients/new-client.png",
  "width": 300,
  "height": 100
}
```

메인과 회사소개에 함께 반영됩니다. 실제 표시 크기는 CSS가 비율을 유지해 맞춥니다.
로고 목록과 회사별 실적 고객사 목록은 별개입니다.

## 문구·이미지 교체

해당 `src/pages/*.html`의 구역 주석 아래 문구 또는 `img src`를 수정합니다.
`{{CLIENT_PROJECTS}}` 등은 JSON 데이터를 넣는 자리이므로 직접 항목을 적지 않습니다.

- `src/assets/images/clients/`: 고객사 로고
- `src/assets/images/company/`: 회사소개·경쟁력 사진
- `src/assets/images/customer-experience/`: Medallia 이미지
- `src/assets/brand/`: 코어플렉스 로고·파비콘

## JS 기능별 위치

| 파일                       | 기능                            |
| -------------------------- | ------------------------------- |
| `src/scripts/common.js`    | 메뉴·현재 페이지·섹션 진입 효과 |
| `src/scripts/motion.js`    | 입체 개념 모션                  |
| `src/scripts/records.js`   | 고객사 검색·지역 필터·연도 탐색 |
| `src/scripts/solutions.js` | 금융솔루션 상세 펼침            |
| `src/scripts/video.js`     | 영상 진입 자동 재생·이탈 정지   |

`scripts/build.mjs`는 페이지 생성, `dev.mjs`는 로컬 서버, `check.mjs`는 연결 확인용입니다.
Medallia 상담은 기존 Google 신청서, 채용은 `admin@crflx.com` 메일 앱 연결입니다.
기존 `business.html`, `history.html`, `cx.html` 주소도 새 이름으로 연결됩니다.
`CNAME`은 기존 도메인 설정입니다. 이번 작업은 로컬 수정이며 운영 사이트에 배포하지 않습니다.

## 한국어·영어 페이지

- 한국어 문구: `src/pages/*.html`
- 영어 문구: `src/pages/en/*.html`
- 영어 공통 메뉴·푸터: `src/components/en/`
- 출력 주소: 한국어 `/index.html`, 영어 `/en/index.html`. 헤더 KO/EN으로 현재 페이지를 유지해 전환합니다.
- 실적은 같은 JSON의 `ko`, `en`을 함께 작성합니다. 고객사 영문 이름은 `nameEn`입니다. 두 언어의 건수·순서가 자동으로 일치합니다.
- 이미지에 포함된 공식 로고는 원본을 유지하며, 설명과 대체 텍스트는 언어별로 표시합니다.

기존 서버가 실행 중인 동안에는 http://localhost:4174/dist/ 에서 생성 결과를 볼 수 있습니다. `npm run dev`는 4175를 사용합니다. 루트 `index.html`은 이 미리보기로 이동하는 파일이며 실제 화면은 `src/pages/index.html`에서 수정합니다.
