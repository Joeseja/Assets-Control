
// Ported from PowerBuilder Logic

// Helper to reverse string (used in other modes if needed, keeping for compatibility)
const reverseString = (str: string): string => {
  return str.split('').reverse().join('');
};

// Case 1 Encode (Inverse of the provided decryption):
// Used to generate Mock Data that satisfies the Case 1 Decrypt logic
export const encodeCase1 = (data: string): string => {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    // Logic: 
    // We need pairs.
    // CharA (Encrypted) = Original + Random
    // CharB (Key)       = Random + 33
    
    // Simulate PB rand(10) - 1 => 0..9
    let random = Math.floor(Math.random() * 10);
    while (random === 1 || random === 6) {
      random = Math.floor(Math.random() * 10);
    }
    
    const charCode = data.charCodeAt(i);
    const firstChar = String.fromCharCode(charCode + random);
    const secondChar = String.fromCharCode(random + 33);
    
    result += firstChar + secondChar;
  }
  return result;
};

// Function decodepass (Ported from PowerBuilder)
/*
  i = 1
  do while (i < len(as_data))
    ls_result = ls_result+char(asc(mid(as_data, i, 1)) - (asc(mid(as_data, i+1, 1)) - 33))
    i = i+2
  loop
*/
export const decodepass = (as_data: string): string => {
  if (!as_data) return as_data;
  
  let ls_result = "";
  let i = 0; // PB starts at 1, TS/JS starts at 0

  while (i < as_data.length) {
    // asc(mid(as_data, i, 1)) -> In JS: as_data.charCodeAt(i)
    if (i + 1 >= as_data.length) break;
    
    const charCode1 = as_data.charCodeAt(i);
    const charCode2 = as_data.charCodeAt(i + 1);
    
    // char(asc(...) - (asc(...) - 33))
    const derivedChar = String.fromCharCode(charCode1 - (charCode2 - 33));

    ls_result += derivedChar;
    
    // i = i+2
    i += 2;
  }
  
  return ls_result;
};

// Keeping existing functions for compatibility
export const encodeMode2 = (data: string): string => {
  let result = data;
  for (let i = 2; i <= result.length; i++) {
    const leftPart = result.substring(0, i);
    const rightPart = result.substring(i);
    result = reverseString(leftPart) + rightPart;
  }
  return result;
};

export const decodeMode2 = (data: string): string => {
  let result = data;
  for (let i = result.length; i >= 2; i--) {
    const leftPart = result.substring(0, i);
    const rightPart = result.substring(i);
    result = reverseString(leftPart) + rightPart;
  }
  return result;
};

export const encryptPassword = encodeCase1; 
export const decryptPassword = decodepass; 
