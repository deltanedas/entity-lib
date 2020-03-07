if (this.global.entityLib === undefined) {
	this.global.entityLib = {features: {}};

	require("common");
	require("mech");
	require("unit");
	require("wrapper");
	require("melee");
}