import _ from 'lodash'

import hasDepartment from 'sto-helpers/lib/hasDepartment'
import isRequiredCourse from 'sto-helpers/lib/isRequiredCourse'

const asianDeptRequiredCourses = [
	{deptnum: 'ASIAN 275'}, {deptnum: 'ASIAN 397'}, {deptnum: 'ASIAN 399'},
]

let isRequiredAsianStudiesCourse = isRequiredCourse(asianDeptRequiredCourses)

function asianLanguageCourses(course) {
	// If all of these match, it is a language course, and will be
	// rejected by the `reject` method.
	return hasDepartment(['CHINA', 'JAPAN'], course)
}

function electives(courses) {
	// An Asian studies concentration consists of six courses:
	// - At least two of the six courses must be taken on campus
	// - No language courses may count toward this concentration

	let asianStudiesElectives = _(courses)
		.filter(hasDepartment('ASIAN'))
		.reject(asianLanguageCourses)
		.reject(isRequiredAsianStudiesCourse)
		.value()

	let asianStudiesElectivesOnCampus = _(asianStudiesElectives)
		.reject({kind: 'fabrication'})
		.value()

	let totalTaken = _.size(asianStudiesElectives)
	let needs = 6

	let takenOnCampus = _.size(asianStudiesElectivesOnCampus)
	let needsOnCampus = 2

	let result = _.all([
		totalTaken >= needs,
		takenOnCampus >= needsOnCampus,
	])

	return {
		title: 'Electives',
		type: 'object/number',
		description: '// An Asian studies concentration consists of six courses: At least two of the six courses must be taken on campus, and No language courses may count toward this concentration',
		result: result,
		details: {
			has: totalTaken,
			needs: needs,
			matches: asianStudiesElectives,
		},
	}
}

function checkAsianStudiesConcentration(studentData) {
	return studentData.then((studentPieces) => {
		let {courses} = studentPieces

		let asianStudiesConcentrationRequirements = [
			electives(courses),
		]

		return {
			result: _.all(asianStudiesConcentrationRequirements, 'result'),
			details: asianStudiesConcentrationRequirements,
		}
	})
}

let asianStudiesConcentration = {
	title: 'Asian Studies',
	type: 'concentration',
	id: 'c-asian',
	departmentAbbr: 'ASIAN',
	revisionYear: 2011,

	check: checkAsianStudiesConcentration,
	_requirements: {
		electives,
	},
}

export default asianStudiesConcentration