import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCart,moneyCents,canTransitionDelivery} from '../src/lib/commerce';
import {signSession,verifySession} from '../src/lib/session';
const id='11111111-1111-4111-8111-111111111111';
test('variants survive normalization and duplicate lines cannot bypass quantity limits',()=>{
 const items=parseCart([{productId:id,size:'S',color:'Blue',quantity:2},{productId:id,size:'M',color:'Blue',quantity:1}]);
 assert.equal(items.length,2);assert.deepEqual(new Set(items.map(x=>x.size)),new Set(['S','M']));
 assert.throws(()=>parseCart([{productId:id,size:'S',color:'Blue',quantity:6},{productId:id,size:'S',color:'Blue',quantity:6}]));
 for(const quantity of [0,-1,1.2,'2',NaN])assert.throws(()=>parseCart([{productId:id,size:'S',color:'Blue',quantity}]));
});
test('money rejects malformed values instead of silently rounding',()=>{assert.equal(moneyCents(50.01),5001);for(const value of ['50',NaN,Infinity,0,-5,50.001])assert.throws(()=>moneyCents(value));});
test('delivery transitions enforce fulfillment sequence',()=>{assert.ok(canTransitionDelivery('packed','shipped'));assert.ok(!canTransitionDelivery('pending','delivered'));assert.ok(!canTransitionDelivery('cancelled','shipped'));});
test('signed identities reject tampering, expiry and wrong purposes',()=>{process.env.SESSION_SECRET='test-secret-at-least-thirty-two-characters';const session=signSession({sub:id,purpose:'influencer',exp:Date.now()/1000+60});assert.equal(verifySession(session,'influencer')?.sub,id);assert.equal(verifySession(session+'x','influencer'),null);assert.equal(verifySession(session,'oauth:tiktok'),null);assert.equal(verifySession(signSession({sub:id,purpose:'influencer',exp:1}),'influencer'),null);});
