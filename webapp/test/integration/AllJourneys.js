jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 solicitudVacacionesSet in the list
// * All 3 solicitudVacacionesSet have at least one toEmpleado

sap.ui.require([
	"sap/ui/test/Opa5",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/App",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Browser",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Master",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Detail",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Create",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "enap.f2.ZHR_SOL_VAC.view."
	});

	sap.ui.require([
		"enap/f2/ZHR_SOL_VAC/test/integration/MasterJourney",
		"enap/f2/ZHR_SOL_VAC/test/integration/NavigationJourney",
		"enap/f2/ZHR_SOL_VAC/test/integration/NotFoundJourney",
		"enap/f2/ZHR_SOL_VAC/test/integration/BusyJourney",
		"enap/f2/ZHR_SOL_VAC/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});