// Workers Builds production-branch command: intentionally has no deployment side effects.
console.log(JSON.stringify({status:'BLOCKED',target:'production',reason:'Production is not approved in P01. No upload, migration or deployment performed.'}));
