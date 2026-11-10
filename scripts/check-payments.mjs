import assert from 'node:assert/strict';
import {adjustPaymentDate,paymentDate,nextPaymentDate,paymentOccurrences,paymentRule} from '../assets/payment-schedule.js';

const as=(date,rule,expected)=>assert.equal(adjustPaymentDate(date,rule),expected);
as('2027-08-27','previous_thursday_next_sunday','2027-08-26');
as('2026-06-27','previous_thursday_next_sunday','2026-06-28');
as('2026-05-01','previous_thursday_next_sunday','2026-04-30');
as('2026-08-01','previous_thursday_next_sunday','2026-08-02');
as('2026-01-31','previous_workday','2026-01-29');
assert.equal(paymentRule({id:'salary',mode:'monthly',day:27}),'previous_thursday_next_sunday');
assert.equal(paymentRule({id:'housing',mode:'monthly',day:24}),'none');
assert.equal(paymentDate({id:'salary',mode:'monthly',day:27},2026,11),'2026-11-26');
assert.equal(paymentDate({id:'salary',mode:'monthly',day:27,paymentOverrides:{'2026-11':'2026-11-24'}},2026,11),'2026-11-24');
assert.equal(nextPaymentDate({id:'social',mode:'monthly',day:1},'2026-04-29'),'2026-04-30');
assert.equal(nextPaymentDate({id:'social',mode:'monthly',day:1},'2026-05-01'),'2026-06-01');
assert.ok(paymentOccurrences({id:'social',mode:'monthly',day:1},'2026-04-01',2).includes('2026-04-30'));
console.log('Payment scheduling tests passed');
