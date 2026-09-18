export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

export const nowISO = () => new Date().toISOString();

export function movementEffect(movement) {
  return movement.direction === 'in' ? Number(movement.quantity) : -Number(movement.quantity);
}

export function onHand(itemId, movements, locationId = null) {
  return movements
    .filter(m => m.itemId === itemId && (!locationId || m.locationId === locationId))
    .reduce((sum, m) => sum + movementEffect(m), 0);
}

export function reserved(itemId, reservations, at = new Date()) {
  return reservations
    .filter(r => r.itemId === itemId && r.status === 'active' && (!r.expiry || new Date(r.expiry) > at))
    .reduce((sum, r) => sum + Number(r.quantity), 0);
}

export function inventory(itemId, movements, reservations) {
  const physical = onHand(itemId, movements);
  const held = reserved(itemId, reservations);
  return { onHand: physical, reserved: held, available: physical - held };
}

export function validateMovement({ itemId, quantity, direction, sourceEventId }, movements, available = Infinity) {
  if (!itemId) throw new Error('Choose an item.');
  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) throw new Error('Enter a quantity greater than zero.');
  if (!['in', 'out'].includes(direction)) throw new Error('Movement direction is invalid.');
  if (sourceEventId && movements.some(m => m.sourceEventId === sourceEventId)) throw new Error('This source event was already processed.');
  if (direction === 'out' && Number(quantity) > available) throw new Error('There is not enough available stock.');
}

export function createReversal(original, reason = 'Voided transaction') {
  if (original.reversedBy) throw new Error('This transaction was already reversed.');
  return {
    ...original,
    id: uid('mov'),
    direction: original.direction === 'in' ? 'out' : 'in',
    type: 'Reversal',
    reason,
    sourceEventId: null,
    reversesId: original.id,
    reversedBy: null,
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
}

export function correctionFor(original, correctedQuantity) {
  const difference = Number(correctedQuantity) - Number(original.quantity);
  if (!Number.isFinite(Number(correctedQuantity)) || Number(correctedQuantity) < 0) throw new Error('Corrected quantity must be zero or greater.');
  if (difference === 0) throw new Error('The corrected quantity is unchanged.');
  return {
    id: uid('mov'), itemId: original.itemId, quantity: Math.abs(difference),
    direction: difference > 0 ? original.direction : (original.direction === 'in' ? 'out' : 'in'),
    type: 'Adjustment', reason: `Correction to ${original.type}`,
    reference: original.reference || '', locationId: original.locationId,
    unitCost: original.unitCost || 0, notes: `Corrects ${original.id}`,
    correctsId: original.id, createdAt: nowISO(), updatedAt: nowISO()
  };
}

export function weightedAverageCost(itemId, movements) {
  let quantity = 0, value = 0;
  movements.filter(m => m.itemId === itemId).forEach(m => {
    if (m.direction === 'in') { value += Number(m.quantity) * Number(m.unitCost || 0); quantity += Number(m.quantity); }
    else if (quantity > 0) { const cost = value / quantity; quantity -= Number(m.quantity); value -= Number(m.quantity) * cost; }
  });
  return quantity > 0 ? value / quantity : 0;
}
