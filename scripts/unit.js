const UnitTypeDef = extend(this.global.entityLib.Common, {
	// @Override
	loadAfter: function(){
		print("Hello client!");
	}
});

this.global.entityLib.UnitType = extend(UnitType, UnitTypeDef);