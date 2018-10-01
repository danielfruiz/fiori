jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/App",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Browser",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Master",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/Detail",
	"enap/f2/ZHR_SOL_VAC/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "enap.f2.ZHR_SOL_VAC.view."
	});

	sap.ui.require([
		"enap/f2/ZHR_SOL_VAC/test/integration/NavigationJourneyPhone",
		"enap/f2/ZHR_SOL_VAC/test/integration/NotFoundJourneyPhone",
		"enap/f2/ZHR_SOL_VAC/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});