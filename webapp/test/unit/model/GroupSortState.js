sap.ui.define([
	"enap/f2/ZHR_SOL_VAC/model/GroupSortState",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function () {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("FleCo").length, 1, "The sorting by FleCo returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("Begda").length, 1, "The sorting by Begda returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("FleCo").length, 1, "The group by FleCo returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});

	QUnit.test("Should set the sorting to FleCo if the user groupes by FleCo", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("FleCo");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "FleCo", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by Begda and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "FleCo");

		this.oGroupSortState.sort("Begda");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});