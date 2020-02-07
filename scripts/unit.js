const Unitdef = Object.create(this.global.entityLib.Common);
Object.assign(Unitdef, {
	// @Override
	draw(parent){
		const rot = (this.getTrueRotation(parent) || 0) - 90;
		this.drawUnder(parent, rot);
		this.drawWeapons(parent, rot);
		this.drawAbove(parent, rot);
	}
});

this.global.entityLib.UnitType = Unitdef;