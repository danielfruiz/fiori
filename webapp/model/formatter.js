sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		fecha: function (sValue) {
			// if (sValue === null || sValue === undefined){
			if (!sValue) {
				return sValue;
			}
			var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
				"Jul", "Ago", "Sept", "Oct", "Nov", "Dic"
			];
			var day = sValue.getUTCDate();
			var monthIndex = sValue.getUTCMonth();
			var year = sValue.getUTCFullYear();
			return day + "/" + meses[monthIndex] + "/" + year;

		},

		statusTxt: function (sValue) {
			switch (sValue) {
			case "A":
				return "Aprobado";
			case "R":
				return "Rechazado";
			default:
				return "Pendiente";
			}
		},

		statusColor: function (sValue) {
			switch (sValue) {
			case "A":
				return "Success";
			case "R":
				return "Error";
			default:
				return "None";
			}
		},

		booleanoSiNo: function (sValue) {
			//var sFlag = sValue.toString().trim();
			var sFlag = sValue;

			if (sFlag === "X" || sValue === true) {
				return "Si";
			} else if (sFlag === "" || sValue === false) {
				return "No";
			} else {
				return sValue;
			}
		},

		booleanoTrueFalse: function (sValue) {
			switch (sValue) {
			case "X":
				return true;
			case "":
				return false;
			default:
				return sValue;
			}
		}
	};

});