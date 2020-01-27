const UnitType = extend(entityLib.Common, {
	// @Override
	loadAfter: function(){
		print("Hello client!");
	}
});

entityLib.UnitType = UnitType;