class PositionManager {
  constructor() {
    this.positions = [];
    this.nextId = 1;
  }

  addPosition(code, name) {
    const position = {
      id: this.nextId++,
      code,
      name,
    };
    this.positions.push(position);
    return position;
  }

  updatePosition(id, newData) {
    const pos = this.positions.find((p) => p.id === id);
    if (pos) {
      if (newData.code !== undefined) pos.code = newData.code;
      if (newData.name !== undefined) pos.name = newData.name;
      return pos;
    }
    return null;
  }

  deletePosition(id) {
    const index = this.positions.findIndex((p) => p.id === id);
    if (index !== -1) {
      return this.positions.splice(index, 1)[0];
    }
    return null;
  }

  getAllPositions() {
    return this.positions;
  }
}

// Example usage:
const positionManager = new PositionManager();
