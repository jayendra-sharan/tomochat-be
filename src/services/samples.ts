import { AiResponse, supportedLanguage } from "./types";

const samples: Partial<Record<supportedLanguage, AiResponse[]>> = {
  "nl-NL":[
    {
      "isMessageOk": true,
      "original": "Ik denk dat ik straks naar huis ga.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I guess I’ll go there later.",
      "fixedMessage": "Ik denk dat ik daar later naartoe ga.",
      "fixLogic": "translated to Dutch"
    },
    {
      "isMessageOk": false,
      "original": "Ik weet niet what to say now.",
      "fixedMessage": "Ik weet niet wat ik nu moet zeggen.",
      "fixLogic": "translated English part and adjusted fluency"
    },
    {
      "isMessageOk": false,
      "original": "Ik heb een appel gegeten gisteren.",
      "fixedMessage": "Ik heb gisteren een appel gegeten.",
      "fixLogic": "word order correction"
    }
  ],
  "es-ES": [
    {
      "isMessageOk": true,
      "original": "Voy a salir con mis amigos esta noche.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I think it’s going to rain soon.",
      "fixedMessage": "Creo que va a llover pronto.",
      "fixLogic": "translated to Spanish"
    },
    {
      "isMessageOk": false,
      "original": "Mañana I will visit mis abuelos.",
      "fixedMessage": "Mañana visitaré a mis abuelos.",
      "fixLogic": "translated English segment and corrected verb and preposition"
    },
    {
      "isMessageOk": false,
      "original": "Yo está muy feliz hoy.",
      "fixedMessage": "Yo estoy muy feliz hoy.",
      "fixLogic": "verb agreement correction"
    }
  ],
  "uk-UA": [
    {
      "isMessageOk": true,
      "original": "Мені сьогодні дуже сподобалося.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I think I’ll go to the market later.",
      "fixedMessage": "Я думаю, що пізніше піду на ринок.",
      "fixLogic": "translated to Ukrainian"
    },
    {
      "isMessageOk": false,
      "original": "Я хочу buy some хліб.",
      "fixedMessage": "Я хочу купити трохи хліба.",
      "fixLogic": "translated English part and improved word order"
    },
    {
      "isMessageOk": false,
      "original": "Мені подобається цей погода.",
      "fixedMessage": "Мені подобається ця погода.",
      "fixLogic": "corrected gender of article"
    }
  ],
  "el-GR": [
    {
      "isMessageOk": true,
      "original": "Είναι πολύ ωραία μέρα σήμερα.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I believe it’s going to be a nice day.",
      "fixedMessage": "Πιστεύω ότι θα είναι μια όμορφη μέρα.",
      "fixLogic": "translated to Greek"
    },
    {
      "isMessageOk": false,
      "original": "Θα go στο σπίτι μετά.",
      "fixedMessage": "Θα πάω στο σπίτι μετά.",
      "fixLogic": "translated verb 'go'"
    },
    {
      "isMessageOk": false,
      "original": "Εγώ είναι πολύ κουρασμένος.",
      "fixedMessage": "Εγώ είμαι πολύ κουρασμένος.",
      "fixLogic": "corrected verb form"
    }
  ],
  "hi-IN": [
    {
      "isMessageOk": true,
      "original": "मैं थोड़ी देर में आऊँगा।",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I guess I’ll meet him tomorrow.",
      "fixedMessage": "मुझे लगता है कि मैं कल उससे मिलूंगा।",
      "fixLogic": "translated to Hindi"
    },
    {
      "isMessageOk": false,
      "original": "मैं think यह सही नहीं है।",
      "fixedMessage": "मुझे लगता है कि यह सही नहीं है।",
      "fixLogic": "translated 'think' and simplified phrasing"
    },
    {
      "isMessageOk": false,
      "original": "मैं कल बाजार जाता हूँ।",
      "fixedMessage": "मैं कल बाजार जाऊँगा।",
      "fixLogic": "corrected tense"
    }
  ],
  "fa-IR": [
    {
      "isMessageOk": true,
      "original": "من امروز وقت آزاد دارم.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I think I’ll stay home today.",
      "fixedMessage": "فکر می‌کنم امروز در خانه بمانم.",
      "fixLogic": "translated to Farsi"
    },
    {
      "isMessageOk": false,
      "original": "من می‌خواهم to rest a little.",
      "fixedMessage": "من می‌خواهم کمی استراحت کنم.",
      "fixLogic": "translated English part"
    },
    {
      "isMessageOk": false,
      "original": "من خیلی خسته هستم الان.",
      "fixedMessage": "من الان خیلی خسته‌ام.",
      "fixLogic": "corrected verb structure"
    }
  ],
  "it-IT": [
    {
      "isMessageOk": true,
      "original": "Vado a prendere un caffè.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I guess I’ll see her at the party.",
      "fixedMessage": "Credo che la vedrò alla festa.",
      "fixLogic": "translated to Italian"
    },
    {
      "isMessageOk": false,
      "original": "Domenica I will go al mare.",
      "fixedMessage": "Domenica andrò al mare.",
      "fixLogic": "translated English part and verb"
    },
    {
      "isMessageOk": false,
      "original": "Io essere molto felice oggi.",
      "fixedMessage": "Io sono molto felice oggi.",
      "fixLogic": "corrected verb 'essere' to 'sono'"
    }
  ],
  "fr-FR": [
    {
      "isMessageOk": true,
      "original": "Je vais faire les courses.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I guess I’ll eat something now.",
      "fixedMessage": "Je suppose que je vais manger quelque chose maintenant.",
      "fixLogic": "translated to French"
    },
    {
      "isMessageOk": false,
      "original": "Je suis tired aujourd’hui.",
      "fixedMessage": "Je suis fatigué aujourd’hui.",
      "fixLogic": "translated 'tired'"
    },
    {
      "isMessageOk": false,
      "original": "Demain je vais aller le parc avec amis.",
      "fixedMessage": "Demain, je vais aller au parc avec des amis.",
      "fixLogic": "fixed article and preposition usage"
    }
  ],
  "de-DE": [
    {
      "isMessageOk": true,
      "original": "Ich bin gerade nach Hause gekommen.",
      "fixedMessage": "",
      "fixLogic": ""
    },
    {
      "isMessageOk": false,
      "original": "I think I’ll call him later.",
      "fixedMessage": "Ich glaube, ich rufe ihn später an.",
      "fixLogic": "translated to German"
    },
    {
      "isMessageOk": false,
      "original": "Ich glaube I forgot mein Schlüssel.",
      "fixedMessage": "Ich glaube, ich habe meinen Schlüssel vergessen.",
      "fixLogic": "translated English part and corrected article"
    },
    {
      "isMessageOk": false,
      "original": "Ich bin sehr müde heute ich schlafen früh.",
      "fixedMessage": "Ich bin heute sehr müde, ich werde früh schlafen gehen.",
      "fixLogic": "added verb phrase and fixed punctuation"
    }
  ]
}


export const getSample = (languageCode: supportedLanguage) => {
  const responses = samples[languageCode];
  return responses.map(item => JSON.stringify(item)).join("\n")
} 
