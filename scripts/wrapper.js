const entityLib = this.global.entityLib;

function extendMech(Base, name, features){
	// Merge features over the original entity-lib definition.
	const mechDef = Object.create(entityLib.Mech);
	(features || []).forEach(def => {
		Object.assign(mechDef, def);
	});

	return extendContent(Base, name, mechDef);
}

function extendUnit(Base, name, features){
	const unitDef = Object.create(entityLib.UnitType);
	(features || []).forEach(def => {
		Object.assign(unitDef, def);
	});

	const ret = extendContent(UnitType, name, unitDef);
	ret.constructor = prov(() => {
		return new Base();
	});
	return ret;
	// TODO: lobby for rhino to let us use Class.new or something, this is janky
}

function extendWeapon(Base, parent, features){
	const weaponDef = Object.create(entityLib.MultiWeapon);
	(features || []).forEach(def => {
		Object.assign(weaponDef, def);
	});

	const ret = extendContent(Weapon, parent.name + "-multiweapon", weaponDef);
	ret.parent = parent;
	ret.bullet = extend(BasicBulletType, {
		range(){
			return 0; // Unit range overrides it.
		}
	});
	ret.isMech = parent.turnCursor !== undefined; // Will not work if UnitType gains a turnCursor field
	return ret;
}

this.global.entityLib.extendMech = extendMech;
this.global.entityLib.extendUnit = extendUnit;
this.global.entityLib.extendWeapon = extendWeapon;