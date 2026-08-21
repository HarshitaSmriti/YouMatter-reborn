export function handleCrisisRequest(riskInfo) {
  return {
    reply: `I hear how much pain you're in right now, and I want you to be safe. Please know that you are not alone and there is support available right this second.

If you are in immediate danger or need someone to talk to right now, please reach out to these free, confidential helplines:

📞 **India Mental Health Support (Tele-MANAS)**: 14416 or 1800-891-4416
📞 **KIRAN Helpline**: 1800-599-0019
📞 **International Emergency**: 911 or 112 / Local Emergency Services

You can also take a moment to try our gentle **Breathing Exercises** (/breathing). I'm right here with you. Please reach out to a trusted loved one or professional right now.`,
    isCrisis: true,
    riskLevel: "HIGH",
    recommendedAction: "REQUEST_GUARDIAN_NOTIFICATION",
    matchedKeyword: riskInfo?.keyword || null,
  };
}
