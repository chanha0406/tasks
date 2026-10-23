# Tasks 개요

- 작성일: 2026-10-23
- 근거: `appinfo/info.xml`, `README.md`, `lib/AppInfo/Application.php`, `src/`, `lib/`. 원격은 `git remote -v`. 해시는 `git rev-parse`. 브랜치 `ios-location-reminders`. HEAD `1d7c8230` (`1d7c8230404ff52f7d7f47d80a08a891a442c9d3`). `upstream/main` `24fd6157` (`24fd6157a241de3230c24f9e096f8cc640a7b940`). `origin/main` short `1017a9e0` (`git rev-parse --short origin/main`).
- 상태: 초안

## 목적

Nextcloud용 할 일 앱이다. `appinfo/info.xml`의 `<name>`은 Tasks, `<id>`는 `tasks`다. PHP 네임스페이스는 `OCA\Tasks`이고, `lib/AppInfo/Application.php`의 `APP_ID`는 `tasks`다. 할 일을 편집하고 CalDAV로 동기화한다.

## 구성

제품 코드는 이 저장소 루트에 있다. `.gitmodules`는 없다.

- `appinfo/`: 앱 메타데이터와 라우트
- `lib/`: PHP. 확인한 하위 디렉터리는 `AppInfo`, `Controller`, `Dashboard`, `Listeners`, `Service`
- `src/`: Vue 프론트. 확인한 하위 디렉터리는 `components`, `filters`, `helpers`, `mixins`, `models`, `services`, `store`, `utils`, `views`
- `templates/`, `css/`, `img/`, `tests/`
- `l10n/`: 번역. 이번 추가 수정 검토에서는 제외
- `js/`: 프론트 빌드 산출물. 이번 추가 수정 검토에서는 제외

## 주요 기능

`README.md`와 `appinfo/info.xml`에 적힌 기능이다.

- 할 일 추가와 삭제, 제목, 설명, 시작일과 마감일, 우선순위와 상태
- 하위 작업
- 중요, 현재, 다가오는 할 일의 스마트 컬렉션
- 다른 캘린더로 옮기거나 하위 작업으로 만드는 드래그 앤드 드롭
- 사용자 간 공유
- CalDAV 동기화. 할 일 목록은 Nextcloud 캘린더에 연결된다
- 캘린더별 ICS 다운로드

로컬 브랜치 `ios-location-reminders`는 `upstream/main` 위에 Apple 위치·차량 알림 표시를 올렸다. 속성 이름은 `X-APPLE-PROXIMITY`다. 화면 문구는 `src/utils/appleProximity.js`의 `formatAppleProximityAlarm`과 `src/utils/dateStrings.js`의 `formatAlarm` 앞단이다.

## 원격과 해시

`git remote -v`:

- origin: `git@github.com:chanha0406/tasks.git` (fetch, push)
- upstream: `git@github.com:nextcloud/tasks.git` (fetch, push)
- backup: `ssh://git@git.chanha.kr:2224/chanha0406/tasks.git` (fetch, push)

`git rev-parse`:

- HEAD: `1d7c8230404ff52f7d7f47d80a08a891a442c9d3` (short `1d7c8230`)
- upstream/main: `24fd6157a241de3230c24f9e096f8cc640a7b940` (short `24fd6157`)
- origin/main short: `1017a9e0`. 전체 해시는 이 문서에 적지 않는다.

## 미확인

- 서버에 설치된 앱의 경로, 버전, 동작
- `origin/main`의 전체 해시
- 원격 추적 브랜치와 로컬 HEAD가 같은지는 `git status`가 깨끗하다는 것까지만 보았다. `ls-remote`는 하지 않았다
