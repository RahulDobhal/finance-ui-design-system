export const currencyDigits = code => new Intl.NumberFormat('en',{style:'currency',currency:code}).resolvedOptions().maximumFractionDigits;
export function parseMinor(value,currency='USD') {
  const precision=currencyDigits(currency);
  const text=String(value).trim();
  if(!new RegExp(`^\\d+(?:\\.\\d{0,${precision}})?$`).test(text) || (precision===0&&text.includes('.'))) return null;
  const [whole,fraction='']=text.split('.');
  const result=Number(whole)*10**precision+Number(fraction.padEnd(precision,'0'));
  return Number.isSafeInteger(result)?result:null;
}
export function formatMoney(minor,currency='USD',locale='en-US',signed=false){
  if(!Number.isSafeInteger(minor))throw new TypeError('Money must use safe integer minor units');
  return new Intl.NumberFormat(locale,{style:'currency',currency,signDisplay:signed?'exceptZero':'auto'}).format(minor/10**currencyDigits(currency));
}
export function makeQuote(sendMinor,{feeMinor=250,rateNumerator=83,rateDenominator=100,from='USD',to='GBP'}={}){
  if(![sendMinor,feeMinor,rateNumerator,rateDenominator].every(Number.isSafeInteger)||sendMinor<0||feeMinor<0||rateNumerator<=0||rateDenominator<=0)throw new TypeError('Invalid quote inputs');
  const net=Math.max(0,sendMinor-feeMinor);
  const numerator=BigInt(net)*BigInt(rateNumerator)*10n**BigInt(currencyDigits(to));
  const denominator=BigInt(rateDenominator)*10n**BigInt(currencyDigits(from));
  const received=Number((numerator+denominator/2n)/denominator);
  if(!Number.isSafeInteger(received))throw new RangeError('Quote exceeds safe integer range');
  return {sendMinor,feeMinor,receiveMinor:received,from,to,valid:sendMinor>feeMinor};
}
export function contrast(a,b){
  const lum=h=>{const v=h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
