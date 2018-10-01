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
			//var formatter = new Intl.DateTimeFormat("es-ES", { month: "short" });
			//var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
			//return sValue.toLocaleString();
			var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
				"Jul", "Ago", "Sept", "Oct", "Nov", "Dic"
			];
			var day = sValue.getDate();
			var monthIndex = sValue.getMonth();
			var year = sValue.getFullYear();
			return day + '/' + meses[monthIndex] + '/' + year;

		}
	};

});