const entityLib = this.global.entityLib;

function extendMech(Base, name, def){
	// Merge def over the original custom Mech definition.
	const mechDef = Object.create(entityLib.Mech);
	Object.assign(mechDef, def);
	return extendContent(Base, name, mechDef);
}

function extendUnit(Base, name, def){
	// Merge def over the original custom Mech definition.
	const unitDef = Object.create(entityLib.Unit);
	Object.assign(unitDef, def);
	return extendContent(Base, name, unitDef);
}

function extendWeapon(Base, parent, def){
	const weaponDef = Object.create(entityLib.MultiWeapon);
	Object.assign(weaponDef, def);
	const ret = extendContent(Weapon, parent.name + "-multiweapon", weaponDef);
	ret.parent = parent;
	ret.isMech = parent.turnCursor !== undefined; // Will not work if UnitType gains a turnCursor field
	ret.weapon = 0;
	return ret;
}

this.global.entityLib.extendMech = extendMech;
this.global.entityLib.extendUnit = extendUnit;
this.global.entityLib.extendWeapon = extendWeapon;