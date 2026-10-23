# 추가 수정 재검토

- 작성일: 2026-10-23
- 근거: 브랜치 `ios-location-reminders`. `git rev-parse --short HEAD`는 `1d7c8230` (`1d7c8230404ff52f7d7f47d80a08a891a442c9d3`). `upstream/main`은 `24fd6157`. 비교 범위는 `upstream/main..HEAD`의 로컬 커밋이다. 본 파일은 `src/components/AppSidebar/Alarm/AlarmListItem.vue`, `src/models/alarm.js`, `src/utils/appleProximity.js`, `src/utils/dateStrings.js`, `tests/javascript/unit/utils/appleProximity.spec.js`. 저장이 이 필드를 다시 쓰는지 보려면 `src/models/task.js`의 `updateAlarm`과 `src/components/AppSidebar/Alarm/AlarmList.vue`의 시작·마감 삭제 경로를 읽었다. 그 두 파일은 로컬 커밋 diff에 없다.
- 상태: 초안

## 판정

추가 수정 없음.

위치 알림 문구를 공통 부트스트랩으로 나누는 리팩토링도 없다. 이전 검토와 같다. 문구는 `formatAppleProximityAlarm` 한 곳이고, `formatAlarm`은 그 반환값이 있으면 기존 시각 문구보다 먼저 반환한다.

## 범위

`upstream/main..HEAD` 커밋은 세 개다.

- `66a97aa9` `feat(alarms): show Apple location and car reminders`. 표시 경로. 검토함.
- `885ab709` `l10n: add Apple location and car reminder strings`. `l10n/` 전체는 제외.
- `1d7c8230` `chore(local): bump version to 1.18.1 for self-hosted install`. `appinfo/info.xml`, `package.json`, `package-lock.json`의 버전 번호만 바꾼다. 할 일 필드나 알림 문구를 쓰지 않는다. 설치 여부는 이번 검토 대상이 아니다.

`js/` 빌드 산출물, `node_modules/`, `l10n/`은 보지 않았다. upstream 전체는 보지 않았다.

## 리팩토링

로컬 기능 커밋은 파서를 새로 두고, 기존 알림 문구 함수 앞에 한 번의 분기를 넣는다. 저장 경로와 알림 편집 저장 형식은 그대로다.

- `src/utils/appleProximity.js`의 `formatAppleProximityAlarm`이 `CONNECT`, `DISCONNECT`, `ARRIVE`, `DEPART`, 그 외 유형의 문장을 만든다.
- `src/utils/dateStrings.js`의 `formatAlarm`은 `formatAppleProximityAlarm(alarm.appleProximity, t)` 결과가 있으면 그 문자열을 반환한다.
- 같은 문장이 다른 파일에 복사되어 있지 않다.

이 배치를 공통 초기화로 나누지 않는다.

## 데이터

`appleProximity`는 화면용 객체 필드다. `mapICALAlarmsToAlarmObjects`가 ICAL `VALARM`을 읽어 필드만 채운다. `VALARM`에 속성을 다시 쓰지 않는다.

시간 편집은 열리지 않는다. `AlarmListItem.vue`의 `canEdit`는 `alarm.appleProximity`가 있으면 `false`다. `Edit time` 버튼은 `canEdit`일 때만 그려지고, 그 버튼만 `updateAlarm`을 보낸다. `task.js`의 `updateAlarm`은 `trigger`만 `updatePropertyWithValue`로 바꾼다. 이번 표시 경로에서는 그 함수가 호출되지 않는다.

시작일이나 마감일을 지울 때의 모달은 `alarm.isRelative`인 항목만 절대 시각으로 바꾸거나 지운다. Apple 위치 알림의 `TRIGGER`는 `VALUE=DATE-TIME`이다. `AlarmComponent.fromICALJs` 결과는 `isRelative === false`였다. 그 모달 목록에 들어가지 않는다.

`Remove reminder`는 그대로다. 사용자가 제거를 누르기 전에는 `removeAlarm`이 호출되지 않는다.

`X-APPLE-PROXIMITY:ARRIVE`와 `X-APPLE-STRUCTURED-LOCATION`(`X-TITLE`, 줄바꿈이 있는 `X-ADDRESS`)을 넣은 `VTODO`를 ical.js `toString()`으로 직렬화한 뒤 CRLF로 다시 파싱하면 `X-APPLE-PROXIMITY`와 `X-TITLE`이 남는다. `getAppleProximityFromIcalAlarm`은 다시 `{ type: "ARRIVE", location: "Example Place" }`를 반환한다. 표시 코드는 이 직렬화를 호출하지 않는다. 제목만 `updatePropertyWithValue`로 바꿔도 메모리의 `VALARM` 속성은 남는다.

## 표시

인식되면 `19760401T005545Z`가 달력 시각으로 나오지 않는다. `formatAlarm`의 절대 시각 분기는 proximity 문구가 없을 때만 탄다.

- `X-APPLE-PROXIMITY`가 `ARRIVE`, `DEPART`, `CONNECT`, `DISCONNECT`이면 그 유형 문구다. 위치가 있으면 `X-TITLE`, 없으면 `X-ADDRESS`다. 줄바꿈과 연속 공백은 한 칸으로 접는다.
- 유형이 없고 sentinel `19760401T005545`만 있으면, 위치가 있으면 `ARRIVE`, 없으면 `LOCATION`이다. `LOCATION` 문구는 `Remind me at a location`이다.
- 일반 `DATE-TIME` 알림과 `null`은 기존 문구로 돌아간다.

`tests/javascript/unit/utils/appleProximity.spec.js`는 4개 모두 통과했다 (`vitest run`, 2026-10-23).

샘플 `VALARM`(차량 `CONNECT`, 장소 `DEPART`/`ARRIVE`, 상대 `TRIGGER:-PT15M`과 함께 있는 경우)에서 `AlarmComponent.fromICALJs`는 예외를 던지지 않았다. `mapICALAlarmsToAlarmObjects`의 `catch`가 그 알림을 목록에서 빼지 않으므로, 뒤 알림의 index가 이 파싱 때문에 밀리지 않는다. 호출한 설치 패키지 `@nextcloud/calendar-js`의 `package.json` version은 `8.1.6`이었다. `package-lock.json`의 같은 항목은 `8.1.7`이다.

목록의 다른 표면은 알림 시각을 그리지 않는다. `TaskBody.vue`는 `task.alarms.length`로 개수만 보여 준다. 새 알림 메뉴의 `formatAlarm` 입력은 `getDefaultAlarmObject`라 `appleProximity`가 `null`이다.

## 탈락한 후보

- 문구를 공통 부트스트랩으로 분리. 유지. 위 리팩토링 절과 같다.
- 서버 설치본이 재배치 전 `1.18.1`인지. 이번 검토 대상이 아니다. 설치 경로는 읽지 않았다.
- `1976-04-01`이 그대로 보임. 유형이나 sentinel이 있으면 `formatAlarm`이 그 전에 문구를 반환한다. 샘플에서 파서는 예외를 던지지 않았다.
- 시간 편집이 `VALARM`의 `trigger`를 덮어씀. `canEdit`가 거짓이라 그 버튼이 없다.
- 저장 때 `X-APPLE-*`가 사라짐. 이번 커밋은 저장 함수를 바꾸지 않는다. CRLF 재파싱에서는 속성이 남는다. `\n`만으로 감싼 실험 문자열에서는 재파싱 결과가 `null`이었는데, 그 입력은 앱이 `toString()`으로 만드는 CRLF와 다르다.
- `VALARM` 밖에만 있는 위치 속성. 로컬 커밋의 코드와 테스트는 `VALARM`의 `X-APPLE-STRUCTURED-LOCATION`만 읽는다. 다른 형태는 이 저장소에서 확인하지 못했다.
- `l10n` 번역이 비어 화면이 빈다는 가설. `l10n`은 범위 밖이다. 소스 문구 자체는 비어 있지 않다.
- `package-lock.json`의 `@nextcloud/calendar-js` `8.1.7`과 설치된 `8.1.6`의 차이. `node_modules`는 범위 밖이다. `8.1.6`에서 샘플 파싱은 예외 없이 끝났고, `8.1.7`에서 표시가 깨지는지는 확인하지 않았다.

## 미확인

- 서버 설치본의 버전과 동작
- Apple이 `VTODO`에만 위치를 두는 입력이 이 앱에서 어떻게 보이는지. 샘플이 저장소에 없다
- `@nextcloud/calendar-js` `8.1.7`의 `fromICALJs` 결과
- `appleProximity.spec.js` 이외의 테스트
