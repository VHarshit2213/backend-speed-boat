import { createSpeedboatSchema } from '../src/validators/speedboat.validator.js';

function test() {
  const body = { name: 'My Speedboat' };
  console.log('--- Testing raw body parse ---');
  const raw = createSpeedboatSchema.safeParse(body);
  console.log('raw.parse success:', raw.success);
  if (!raw.success) console.log('issues:', raw.error.issues);

  console.log('\n--- Testing wrapped object parse ---');
  const wrapped = createSpeedboatSchema.safeParse({ body, params: {}, query: {} });
  console.log('wrapped.parse success:', wrapped.success);
  if (!wrapped.success) console.log('issues:', wrapped.error.issues);
}

test();
