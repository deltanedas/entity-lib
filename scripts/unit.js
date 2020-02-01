const Unitdef = Object.create(this.global.entityLib.Common);
Object.assign(Unitdef, {
	// @Override
	loadAfter: function(){
		print("Hello client!");
	}
});

this.global.entityLib.UnitType = extend(Unit, Unitdef);