sap.ui.define([
	"enap/f2/ZHR_SOL_VAC/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"enap/f2/ZHR_SOL_VAC/model/formatter",
	"sap/m/MessageBox"

], function (BaseController, JSONModel, ODataModel, formatter, MessageBox) {
	"use strict";

	return BaseController.extend("enap.f2.ZHR_SOL_VAC.controller.CreateEntity", {

		_oBinding: {},
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			var that = this;
			this.getRouter().getTargets().getTarget("create").attachDisplay(null, this._onDisplay, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
			this._oViewModel = new JSONModel({
				enableCreate: false,
				delay: 0,
				busy: false,
				mode: "create",
				viewTitle: ""
			});

			//SET MODELS
			this.setModel(this._oViewModel, "viewModel");
			this.setModel(new JSONModel({}), "diasLegales");
			this.setModel(new JSONModel({}), "diasProgresivos");
			this.setModel(new JSONModel({}), "diasAdicionales");

			// Register the view with the message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			var oMessagesModel = sap.ui.getCore().getMessageManager().getMessageModel();
			this._oBinding = new sap.ui.model.Binding(oMessagesModel, "/", oMessagesModel.getContext("/"));
			this._oBinding.attachChange(function (oEvent) {
				var aMessages = oEvent.getSource().getModel().getData();
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						that._oViewModel.setProperty("/enableCreate", false);
					}
				}
			});

			//bindear Empleado a formulario
			var sfEmpleado = this.byId("sfEmpleado");
			sfEmpleado.bindElement({
				path: "/empleadoSet('0')"
			});

			var oEmpModel;
			var _this = this;
			this._oODataModel.read("/empleadoSet('0')/toActivadores", {
				async: false,
				success: function (oData, response) {
					oEmpModel = new JSONModel(oData);
					_this.setModel(oEmpModel, "activadores");
				},
				error: function () {
					sap.m.MessageBox.alert("Error DataModel /empleadoSet('0')/toActivadores");
				}

			});

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user. 
		 * @function
		 * @public
		 */
		onSave: function () {
			var that = this,
				oModel = this.getModel();

			// abort if the  model has not been changed
			if (!oModel.hasPendingChanges()) {
				MessageBox.information(
					this._oResourceBundle.getText("noChangesMessage"), {
						id: "noChangesInfoMessageBox",
						styleClass: that.getOwnerComponent().getContentDensityClass()
					}
				);
				return;
			}

			if (!this._validaForm()) {
				return;
			}

			this.getModel("appView").setProperty("/busy", true);
			if (this._oViewModel.getProperty("/mode") === "edit") {
				// attach to the request completed event of the batch
				oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
					if (that._checkIfBatchRequestSucceeded(oEvent)) {
						that._fnUpdateSuccess();
					} else {
						that._fnEntityCreationFailed();
						MessageBox.error(that._oResourceBundle.getText("updateError"));
					}
				});
			}

			//forzar envio de datos no modificados
			var sPernr = this.getView().byId("Pernr_id").getText();
			var sPath = this.getView().byId("Begda_id").getBindingContext().sPath;
			oModel.setProperty(sPath + "/Pernr", sPernr);

			var oTable = this.getView().byId("solBGVList");
			var aFields = ["/Pernr", "/Carga", "/Begda", "/Endda", "/Relat", "/Vname"];
			var i, aItems, oItem, sBinding, sField, oValue;

			aItems = oTable.getItems();
			for (i = 0; i < aItems.length; i++) {
				oItem = aItems[i];
				var oItemData = oItem.getBindingContext().getObject();
				if (!oItemData.Fbono && !oItemData.Fpres) {
					continue;
				}
				sBinding = oItem.getBindingContextPath();
				for (sField in aFields) {
					oValue = oModel.getProperty(sBinding + aFields[sField]);
					if (oValue instanceof Date) {
						oModel.setProperty(sBinding + aFields[sField], new Date(oValue.getTime() + 1));
					} else {
						oModel.setProperty(sBinding + aFields[sField], new String(oValue));
					}

				}
			}

			//
			oModel.submitChanges();
		},

		_validaForm: function () {
			var oView = this.getView();

			//datos solicitud

			if (this._isEmpty(oView.byId("Begda_id").getValue())) {
				this._messageBox("E", "Debe ingresar Fecha de Inicio");
				return false;
			}

			var Anticp_id = oView.byId("Anticp_id").getSelected();
			var Presta_id = oView.byId("Presta_id").getSelected();
			var DesCo_id = this._isEmpty(oView.byId("DesCo_id").getValue());
			var FleCo_id = this._isEmpty(oView.byId("FleCo_id").getValue());
			var FprCo_id = this._isEmpty(oView.byId("FprCo_id").getValue());
			var FprVe_id = this._isEmpty(oView.byId("FprCo_id").getValue());
			var FadCo_id = this._isEmpty(oView.byId("FprCo_id").getValue());
			var FadVe_id = this._isEmpty(oView.byId("FprCo_id").getValue());

			if (Anticp_id && Presta_id && DesCo_id &&
				FleCo_id &&
				FprCo_id && FprVe_id &&
				FadCo_id && FadVe_id) {
				this._messageBox("E", "Debe Solicitar al menos una opción");
				return false;
			}

			return true;
		},

		_isEmpty: function (oValue) {
			return !oValue || oValue == "0" || oValue == "";
		},

		_messageBox: function (sType, sMessage) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var styleClass = bCompact ? "sapUiSizeCompact" : "";

			switch (sType) {
			case "S":
				MessageBox.success(sMessage, {
					styleClass: styleClass
				});
				break;
			case "E":
				MessageBox.error(sMessage, {
					styleClass: styleClass
				});
				break;
			default:
				MessageBox.information(sMessage, {
					styleClass: styleClass
				});
			}
		},

		_checkIfBatchRequestSucceeded: function (oEvent) {
			var oParams = oEvent.getParameters();
			var aRequests = oEvent.getParameters().requests;
			var oRequest;
			if (oParams.success) {
				if (aRequests) {
					for (var i = 0; i < aRequests.length; i++) {
						oRequest = oEvent.getParameters().requests[i];
						if (!oRequest.success) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Event handler (attached declaratively) for the view cancel button. Asks the user confirmation to discard the changes. 
		 * @function
		 * @public
		 */
		onCancel: function () {
			// check if the model has been changed
			if (this.getModel().hasPendingChanges()) {
				// get user confirmation first
				this._showConfirmQuitChanges(); // some other thing here....
			} else {
				this.getModel("appView").setProperty("/addEnabled", true);
				// cancel without confirmation
				this._navBack();
			}
		},

		onLiveChangeFleCo: function (oEvent) {
			var sDias = oEvent.getParameter("value");
			var iDias;
			try {
				iDias = Number(sDias);
			} catch (err) {
				iDias = 0;
			}

			//bindear tabla
			var oTable = this.getView().byId("solBGVList");
			oTable.bindAggregation("items", {
				path: "/solicitudBGVSet",
				filters: [new sap.ui.model.Filter("FleCo", sap.ui.model.FilterOperator.EQ, iDias)],
				template: oTable.getBindingInfo("items").template
			});

			//this._validateSaveEnablement(oEvent);
			//this.getModel().updateBindings(true);
		},

		onListUpdateFinishedDiasLegales: function (oEvent) {
			var items = this.byId("diasLegalesList").getBinding("items");
			var oModel = items.getModel();
			var i, aKey, oData, iSumAnzhl, iSumKverb, iSumDispo;

			iSumAnzhl = iSumDispo = iSumKverb = 0;

			for (i = 0; i < items.aKeys.length; i++) {
				aKey = items.aKeys[i];
				oData = oModel.oData[aKey];
				iSumAnzhl += oData.Anzhl;
				iSumKverb += oData.Kverb;
				iSumDispo += oData.Dispo;
			}

			var oDiasLegalesModel = this.getModel("diasLegales");
			oDiasLegalesModel.setProperty("/sumAnzhl", iSumAnzhl);
			oDiasLegalesModel.setProperty("/sumKverb", iSumKverb);
			oDiasLegalesModel.setProperty("/sumDispo", iSumDispo);
		},

		onListUpdateFinishedDiasProgresivos: function (oEvent) {
			var items = this.byId("diasProgresivosList").getBinding("items");
			var oModel = items.getModel();
			var i, aKey, oData, iSumAnzhl, iSumKverb, iSumVenta, iSumDispo;

			iSumAnzhl = iSumDispo = iSumKverb = iSumVenta = 0;

			for (i = 0; i < items.aKeys.length; i++) {
				aKey = items.aKeys[i];
				oData = oModel.oData[aKey];
				iSumAnzhl += oData.Anzhl;
				iSumKverb += oData.Kverb;
				iSumVenta += oData.Venta;
				iSumDispo += oData.Dispo;
			}

			var oDiasLegalesModel = this.getModel("diasProgresivos");
			oDiasLegalesModel.setProperty("/sumAnzhl", iSumAnzhl);
			oDiasLegalesModel.setProperty("/sumKverb", iSumKverb);
			oDiasLegalesModel.setProperty("/sumVenta", iSumVenta);
			oDiasLegalesModel.setProperty("/sumDispo", iSumDispo);
		},

		onListUpdateFinishedDiasAdicionales: function (oEvent) {
			var items = this.byId("diasAdicionalesList").getBinding("items");
			var oModel = items.getModel();
			var i, aKey, oData, iSumAnzhl, iSumKverb, iSumVenta, iSumDispo;

			iSumAnzhl = iSumDispo = iSumKverb = iSumVenta = 0;

			for (i = 0; i < items.aKeys.length; i++) {
				aKey = items.aKeys[i];
				oData = oModel.oData[aKey];
				iSumAnzhl += oData.Anzhl;
				iSumKverb += oData.Kverb;
				iSumVenta += oData.Venta;
				iSumDispo += oData.Dispo;
			}

			var oDiasLegalesModel = this.getModel("diasAdicionales");
			oDiasLegalesModel.setProperty("/sumAnzhl", iSumAnzhl);
			oDiasLegalesModel.setProperty("/sumKverb", iSumKverb);
			oDiasLegalesModel.setProperty("/sumVenta", iSumVenta);
			oDiasLegalesModel.setProperty("/sumDispo", iSumDispo);
		},

		/* =========================================================== */
		/* Internal functions
		/* =========================================================== */
		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Details page
		 * @private
		 */
		_navBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getRouter().getTargets().display("object");
			}
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the quit and discard of changes.
		 * @private
		 */
		_showConfirmQuitChanges: function () {
			var oComponent = this.getOwnerComponent(),
				oModel = this.getModel();
			var that = this;
			MessageBox.confirm(
				this._oResourceBundle.getText("confirmCancelMessage"), {
					styleClass: oComponent.getContentDensityClass(),
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.getModel("appView").setProperty("/addEnabled", true);
							oModel.resetChanges();
							that._navBack();
						}
					}
				}
			);
		},

		/**
		 * Prepares the view for editing the selected object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */
		_onEdit: function (oEvent) {
			var oData = oEvent.getParameter("data"),
				oView = this.getView();
			this._oViewModel.setProperty("/mode", "edit");
			this._oViewModel.setProperty("/enableCreate", true);
			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("editViewTitle"));

			oView.bindElement({
				path: oData.objectPath
			});
		},

		/**
		 * Prepares the view for creating new object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */

		_onCreate: function (oEvent) {
			if (oEvent.getParameter("name") && oEvent.getParameter("name") !== "create") {
				this._oViewModel.setProperty("/enableCreate", false);
				this.getRouter().getTargets().detachDisplay(null, this._onDisplay, this);
				this.getView().unbindObject();
				return;
			}

			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("createViewTitle"));
			this._oViewModel.setProperty("/mode", "create");
			var oContext = this._oODataModel.createEntry("solicitudVacacionesSet", {
				success: this._fnEntityCreated.bind(this),
				error: this._fnEntityCreationFailed.bind(this)
			});
			this.getView().setBindingContext(oContext);
		},

		/**
		 * Checks if the save button can be enabled
		 * @private
		 */
		_validateSaveEnablement: function () {
			var aInputControls = this._getFormFields(this.byId("newEntitySimpleForm"));
			var oControl;
			for (var m = 0; m < aInputControls.length; m++) {
				oControl = aInputControls[m].control;
				if (aInputControls[m].required) {
					var sValue = oControl.getValue();
					if (!sValue) {
						this._oViewModel.setProperty("/enableCreate", false);
						return;
					}
				}
			}
			this._checkForErrorMessages();
		},

		/**
		 * Checks if there is any wrong inputs that can not be saved.
		 * @private
		 */

		_checkForErrorMessages: function () {
			var aMessages = this._oBinding.oModel.oData;
			if (aMessages.length > 0) {
				var bEnableCreate = true;
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						bEnableCreate = false;
						break;
					}
				}
				this._oViewModel.setProperty("/enableCreate", bEnableCreate);
			} else {
				this._oViewModel.setProperty("/enableCreate", true);
			}
		},

		/**
		 * Handles the success of updating an object
		 * @private
		 */
		_fnUpdateSuccess: function () {
			this.getModel("appView").setProperty("/busy", false);
			this.getView().unbindObject();
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the success of creating an object
		 *@param {object} oData the response of the save action
		 * @private
		 */
		_fnEntityCreated: function (oData) {
			var sObjectPath = this.getModel().createKey("solicitudVacacionesSet", oData);
			this.getModel("appView").setProperty("/itemToSelect", "/" + sObjectPath); //save last created
			this.getModel("appView").setProperty("/busy", false);
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the failure of creating/updating an object
		 * @private
		 */
		_fnEntityCreationFailed: function () {
			this.getModel("appView").setProperty("/busy", false);
		},

		/**
		 * Handles the onDisplay event which is triggered when this view is displayed 
		 * @param {sap.ui.base.Event} oEvent the on display event
		 * @private
		 */
		_onDisplay: function (oEvent) {
			var oData = oEvent.getParameter("data");
			if (oData && oData.mode === "update") {
				this._onEdit(oEvent);
			} else {
				this._onCreate(oEvent);
			}
		},

		/**
		 * Gets the form fields
		 * @param {sap.ui.layout.form} oSimpleForm the form in the view.
		 * @private
		 */
		_getFormFields: function (oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" ||
					sControlType === "sap.m.CheckBox") {
					aControls.push({
						control: aFormContent[i],
						required: aFormContent[i - 1].getRequired && aFormContent[i - 1].getRequired()
					});
				}
			}
			return aControls;
		}
	});

});