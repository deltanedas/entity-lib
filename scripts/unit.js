print("Unit");
const UnitTypeDef = Object.create(this.global.entityLib.Common);
print("Lets see")
Object.assign(UnitTypeDef, {
	// @Override
	loadAfter: function(){
		print("Hello client!");
	}
});

this.global.entityLib.UnitType = extend(UnitType, UnitTypeDef);