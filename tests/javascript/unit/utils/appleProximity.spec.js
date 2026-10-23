/**
 * SPDX-FileCopyrightText: 2026 YouCha
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ICAL from 'ical.js'
import { describe, expect, it } from 'vitest'

import {
	formatAppleProximityAlarm,
	getAppleProximityFromIcalAlarm,
} from '../../../../src/utils/appleProximity.js'

/**
 * @param {string} icsSnippet VALARM fragment
 * @return {ICAL.Component}
 */
function alarmFrom(icsSnippet) {
	const jCal = ICAL.parse(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VTODO\nUID:test\nSUMMARY:t\n${icsSnippet}\nEND:VTODO\nEND:VCALENDAR`)
	const vtodo = new ICAL.Component(jCal).getFirstSubcomponent('vtodo')
	return vtodo.getFirstSubcomponent('valarm')
}

const t = (app, str, vars = {}) => str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)

describe('utils/appleProximity', () => {
	it('reads a car CONNECT reminder without a place', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:CONNECT
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'CONNECT',
			location: '',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('Getting in the car')
	})

	it('reads DEPART with a structured location title', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:DEPART
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=;X-APPLE-RADIUS=100;X-TITLE=Example Place:geo:51.476900,-0.000500
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'DEPART',
			location: 'Example Place',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('When I leave Example Place')
	})

	it('reads ARRIVE and flattens a folded address', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
X-APPLE-PROXIMITY:ARRIVE
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=Example Street\\nExample City;X-APPLE-RADIUS=100:geo:51.476900,-0.000500
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toEqual({
			type: 'ARRIVE',
			location: 'Example Street Example City',
		})
		expect(formatAppleProximityAlarm(getAppleProximityFromIcalAlarm(alarm), t))
			.toBe('When I arrive at Example Street Example City')
	})

	it('ignores ordinary timed alarms', () => {
		const alarm = alarmFrom(`BEGIN:VALARM
ACTION:DISPLAY
TRIGGER;VALUE=DATE-TIME:20261026T030000Z
END:VALARM`)

		expect(getAppleProximityFromIcalAlarm(alarm)).toBeNull()
		expect(formatAppleProximityAlarm(null, t)).toBeNull()
	})
})
