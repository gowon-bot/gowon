export class FishyEmoji {
  constructor(
    public raw: string,
    public inWater: string,
    public silhouette: string
  ) {}
}

export class TrashEmoji extends FishyEmoji {
  constructor(emoji: string, silhouette: string) {
    super(emoji, emoji, silhouette);
  }
}

export const FishyEmojis = {
  // Trash
  unexplodedOrdnance: new TrashEmoji(
    "<:unexplodedOrdnance:1129947007520358461>",
    "<:uoSilhouette:1129947274856894524>"
  ),

  // Level 1 Fishy

  asianSheepsheadWrasse: new FishyEmoji(
    "<:AsianSheepsheadWrasse:1091499815461994576>",
    "<:AsianSheepsheadWrasseWater:1091500108757078037>",
    "<:aswSilhouette:1091500242911907952>"
  ),
  smoothheadBlobfish: new FishyEmoji(
    "<:SmoothheadBlobfish:1091499806834307223>",
    "<:SmoothheadBlobfishWater:1091500115539275886>",
    "<:sbSilhouette:1091500250767822918>"
  ),
  triplewartSeadevil: new FishyEmoji(
    "<:TriplewartSeadevil:1091499739419246593>",
    "<:TriplewartSeadevilWater:1091499877676093491>",
    "<:tsSilhouette:1091500207138689104>"
  ),
  yellowTang: new FishyEmoji(
    "<:YellowTang:1091499798349226106>",
    "<:YellowTangWater:1091500013600903199>",
    "<:ytSilhouette:1091500241762664508>"
  ),
  blueTang: new FishyEmoji(
    "<:BlueTang:1091499813742329917>",
    "<:BlueTangWater:1091500105598775336>",
    "<:btSilhouette:1091500257046708308>"
  ),
  clownfish: new FishyEmoji(
    "<:Clownfish:1091499810630144070>",
    "<:ClownfishWater:1091500118311719055>",
    "<:cfSilhouette:1091500253447983124>"
  ),
  yellowBoxfish: new FishyEmoji(
    "<:YellowBoxfish:1091499728899952640>",
    "<:YellowBoxfishWater:1091499887931175065>",
    "<:ybSilhouette:1091500191594582026>"
  ),
  peppermintAngelfish: new FishyEmoji(
    "<:PeppermintAngelfish:1091499811976515624>",
    "<:PeppermintAngelfishWater:1091500119754559660>",
    "<:paSilhouette:1091500255243149463>"
  ),
  bandedRainbowfish: new FishyEmoji(
    "<:BandedRainbowfish:1091499805290803350>",
    "<:BandedRainbowfishWater:1091500114150965248>",
    "<:brSilhouette:1091500249287237683>"
  ),
  blueBetta: new FishyEmoji(
    "<:BlueBetta:1091499802975551508>",
    "<:BlueBettaWater:1091500112716497037>",
    "<:bbSilhouette:1091500246623858799>"
  ),
  yellowtailAcei: new FishyEmoji(
    "<:YellowtailAcei:1091499800987443250>",
    "<:YellowtailAceiWater:1091500110178963606>",
    "<:yaSilhouette:1091500244786753678>"
  ),
  rainbowTrout: new FishyEmoji(
    "<:RainbowTrout:1091499736873324705>",
    "<:RainbowTroutWater:1091499878552719372>",
    "<:rtSilhouette:1091500205788114974>"
  ),
  chinookSalmon: new FishyEmoji(
    "<:ChinookSalmon:1091499730166611980>",
    "<:ChinookSalmonWater:1091499886614159390>",
    "<:cs2Silhouette:1091500193125511229>"
  ),
  chumSalmon: new FishyEmoji(
    "<:ChumSalmon:1091499735447261396>",
    "<:ChumSalmonWater:1091499880410796114>",
    "<:csSilhouette:1091500198846541905>"
  ),
  walleye: new FishyEmoji(
    "<:Walleye:1091499731370385488>",
    "<:WalleyeWater:1091499885112594482>",
    "<:wSilhouette:1091500194534801408>"
  ),
  blackCrappie: new FishyEmoji(
    "<:BlackCrappie:1091499809342505072>",
    "<:BlackCrappieWater:1091500116877254810>",
    "<:bcSilhouette:1091500251770269736>"
  ),
  whiteSturgeon: new FishyEmoji(
    "<:WhiteSturgeon:1091499734407069776>",
    "<:WhiteSturgeonWater:1091499882143035432>",
    "<:wsSilhouette:1091500197605019718>"
  ),
  channelCatfish: new FishyEmoji(
    "<:ChannelCatfish:1091499733262028890>",
    "<:ChannelCatfishWater:1091499883439075469>",
    "<:ccSilhouette:1091500196271226934>"
  ),
  northernPuffer: new FishyEmoji(
    "<:NorthernPuffer:1091499404420194446>",
    "<:NorthernPufferWater:1091499873540513822>",
    "<:npSilhouette:1091500188562096219>"
  ),
  blackspottedPuffer: new FishyEmoji(
    "<:BlackspottedPuffer:1091499740925022278>",
    "<:BlackspottedPufferWater:1091499876052893888>",
    "<:bpSilhouette:1091500209948852234>"
  ),
  bullShark: new FishyEmoji(
    "<:BullShark:1091641476162789426>",
    "<:BullSharkWater:1091641509788528750>",
    "<:bsSilhouette:1091642015420256257>"
  ),
  northPacificSwordfish: new FishyEmoji(
    "<:NorthPacificSwordfish:1091641482827534386>",
    "<:NorthPacificSwordfishWater:1091641512678391808>",
    "<:npsSilhouette:1091642014761762898>"
  ),
  hoodwinkerSunfish: new FishyEmoji(
    "<:HoodwinkerSunfish:1091641480877178890>",
    "<:HoodwinkerSunfishWater:1091641510950359110>",
    "<:hsSilhouette:1091642013537030236>"
  ),
  megamouthShark: new FishyEmoji(
    "<:MegamouthShark:1091641479467896913>",
    "<:MegamouthSharkWater:1091642006901633106>",
    "<:ms2Silhouette:1091642011335004222>"
  ),
  danaOctopusSquid: new FishyEmoji(
    "<:DanaOctopusSquid:1091641477421072444>",
    "<:DanaOctopusSquidWater:1091642008961028106>",
    "<:dosSilhouette:1091642010139635833>"
  ),
  skipjackTuna: new FishyEmoji(
    "<:SkipjackTuna:1093404274047844352>",
    "<:SkipjackTunaWater:1093404304775331902>",
    "<:stSilhouette:1093404337830633584>"
  ),
  humpbackGrouper: new FishyEmoji(
    "<:HumpbackGrouper:1093404271212507186> ",
    "<:HumpbackGrouperWater:1093404301906415656>",
    "<:hgSilhouette:1093404334949142559>"
  ),
  redGrouper: new FishyEmoji(
    "<:RedGrouper:1093404272751824897> ",
    "<:RedGrouperWater:1093404303668039700>",
    "<:rgSilhouette:1093404336312291338>"
  ),
  goldenstripedSoapfish: new FishyEmoji(
    "<:GoldenstripedSoapfish:1093404266363879455> ",
    "<:GoldenstripedSoapfishWater:1093404297913454722>",
    "<:gssSilhouette:1093404330830340236>"
  ),
  spanishFlag: new FishyEmoji(
    "<:SpanishFlag:1093404269950013490> ",
    "<:SpanishFlagWater:1093404300757180487>",
    "<:sfSilhouette:1093404333829275648>"
  ),
  whiteedgedLyretail: new FishyEmoji(
    "<:WhiteedgedLyretail:1093404267840294972> ",
    "<:WhiteedgedLyretailWater:1093404299679252542>",
    "<:welSilhouette:1093404332273172540>"
  ),
  seaGoldie: new FishyEmoji(
    "<:SeaGoldie:1101967394844459038>",
    "<:SeaGoldieWater:1101967409285435523>",
    "<:sgSilhouette:1101967385591816232>"
  ),
  atlanticCod: new FishyEmoji(
    "<:AtlanticCod:1101967391732277290>",
    "<:AtlanticCodWater:1101967406424920145>",
    "<:acSilhouette:1101967382970376284>"
  ),
  stripedRaphaelCatfish: new FishyEmoji(
    "<:StripedCatfish:1101967401697935411>",
    "<:StripedCatfishWater:1101967410799579186>",
    "<:scSilhouette:1101967388628500561>"
  ),
  poorCod: new FishyEmoji(
    "<:PoorCod:1101967390285250681>",
    "<:PoorCodWater:1101967403207905400>",
    "<:pcSilhouette:1101967381670133921>"
  ),
  blahaj: new FishyEmoji(
    "<:Blahaj:1103414812635037767>",
    "<:BlahajWater:1103414815432659014>",
    "<:bhSilhouette:1103415399233630288>"
  ),

  // Level 2 Fishy

  pinkShrimp: new FishyEmoji(
    "<:PinkShrimp:1109227666164416602>",
    "<:PinkShrimpWater:1109227631825670144>",
    "<:sSilhouette:1111855045965774908>"
  ),
  brownShrimp: new FishyEmoji(
    "<:BrownShrimp:1109227661584253060>",
    "<:BrownShrimpWater:1109227627186765844>",
    "<:sSilhouette:1111855045965774908>"
  ),
  blackTigerShrimp: new FishyEmoji(
    "<:TigerShrimp:1109227659440963668>",
    "<:TigerShrimpWater:1126793964297662494>",
    "<:sSilhouette:1111855045965774908>"
  ),
  snowballShrimp: new FishyEmoji(
    "<:SnowballShrimp:1109237324069474334>",
    "<:SnowballShrimpWater:1109237335750627390>",
    "<:sSilhouette:1111855045965774908>"
  ),
  blueBoltShrimp: new FishyEmoji(
    "<:BlueBoltShrimp:1109227664146964530>",
    "<:BlueBoltShrimpWater:1109227630546403468>",
    "<:sSilhouette:1111855045965774908>"
  ),
  cardinalShrimp: new FishyEmoji(
    "<:CardinalShrimp:1109227658451091476>",
    "<:CardinalShrimpWater:1109227624082972723>",
    "<:sSilhouette:1111855045965774908>"
  ),
  crystalShrimp: new FishyEmoji(
    "<:CrystalShrimp:1109227652092526713>",
    "<:CrystalShrimpWater:1109227621524443178>",
    "<:sSilhouette:1111855045965774908>"
  ),
  ghostShrimp: new FishyEmoji(
    "<:GhostShrimp:1109227662922231979>",
    "<:GhostShrimpWater:1109227628545720400>",
    "<:sSilhouette:1111855045965774908>"
  ),
  commonSeahorse: new FishyEmoji(
    "<:CommonSeahorse:1112271542559191130>",
    "<:CommonSeahorseWater:1112271577048961064>",
    "<:cs3Silhouette:1112271510950907924>"
  ),
  linedSeahorse: new FishyEmoji(
    "<:LinedSeahorse:1112271536578101288>",
    "<:LinedSeahorseWater:1112271573722873856>",
    "<:lsSilhouette:1112271509025730592>"
  ),
  bigbellySeahorse: new FishyEmoji(
    "<:BigbellySeahorse:1112271537832218665>",
    "<:BigbellySeahorseWater:1112271575018917960>",
    "<:bbsSilhouette:1112271507394154557>"
  ),
  denisesPygmySeahorse: new FishyEmoji(
    "<:PygmySeahorse:1112271535277871194>",
    "<:PygmySeahorseWater:1112271572028362762>",
    "<:psSilhouette:1112271505661907015>"
  ),
  zebraSeahorse: new FishyEmoji(
    "<:ZebraSeahorse:1112271533419802734>",
    "<:ZebraSeahorseWater:1112271570191261776>",
    "<:zsSilhouette:1112271504382632016>"
  ),
  clione: new FishyEmoji(
    "<:Clione:1112271544358543442>",
    "<:ClioneWater:1112271578340806656>",
    "<:cSilhouette:1112271512104353822>"
  ),

  // Level 3 Fishy
  dungenessCrab: new FishyEmoji(
    "<:DungenessCrab:1112868976003911761>",
    "<:DungenessCrabWater:1112869024984993822>",
    "<:dcSilhouette:1112868942831157258>"
  ),
  blueCrab: new FishyEmoji(
    "<:BlueCrab:1112868968798105660>",
    "<:BlueCrabWater:1112869012116869151>",
    "<:bc2Silhouette:1112868934371254396>"
  ),
  floridaStoneCrab: new FishyEmoji(
    "<:FloridaStoneCrab:1112868967237816320>",
    "<:FloridaStoneCrabWater:1112869010292355202>",
    "<:fscSilhouette:1112868933654020186>"
  ),
  sleepyCrab: new FishyEmoji(
    "<:SleepyCrab:1112868969595019448>",
    "<:SleepyCrabWater:1112869016608964608>",
    "<:sc2Silhouette:1112868936111882341>"
  ),
  redDevilVampireCrab: new FishyEmoji(
    "<:RedDevilVampireCrab:1112868972887543849>",
    "<:RedDevilVampireCrabWater:1112869021033963640>",
    "<:rdvcSilhouette:1112868939622522901>"
  ),
  maskedCrab: new FishyEmoji(
    "<:MaskedCrab:1112868971767677070>",
    "<:MaskedCrabWater:1112869019817619466>",
    "<:mcSilhouette:1112868937764458618>"
  ),
  palawanPurpleCrab: new FishyEmoji(
    "<:PalawanPurpleCrab:1112868964914176090>",
    "<:PalawanPurpleCrabWater:1112869008732074005>",
    "<:ppcSilhouette:1112868931766603856>"
  ),
  goldenKingCrab: new FishyEmoji(
    "<:GoldenKingCrab:1112868974410088570>",
    "<:GoldenKingCrabWater:1112869023491821719>",
    "<:gkcSilhouette:1112868941036003428>"
  ),
  purpleSeaUrchin: new FishyEmoji(
    "<:PurpleSeaUrchin:1126781865139900508>",
    "<:PurpleSeaUrchinWater:1126782402061144124>",
    "<:psuSilhouette:1126782375129526312>"
  ),
  americanLobster: new FishyEmoji(
    "<:AmericanLobster:1126781860584882266>",
    "<:AmericanLobsterWater:1126782412911808532>",
    "<:alSilhouette:1126782380653412443>"
  ),
  longSpineSlatePenSeaUrchin: new FishyEmoji(
    "<:LongspineSlatePenSeaUrchin:1126781864191983626>",
    "<:LongspineSlatePenSeaUrchinWater:1126782404347035708>",
    "<:lspsuSilhouette:1126782374064177192>"
  ),
  europeanLobster: new FishyEmoji(
    "<:EuropeanLobster:1126781867518083112>",
    "<:EuropeanLobsterWater:1126782408742670417>",
    "<:elSilhouette:1126782379504193566>"
  ),
  patagonianLobsterette: new FishyEmoji(
    "<:PatagonianLobsterette:1126781868667318394>",
    "<:PatagonianLobsteretteWater:1126782409967415296>",
    "<:plSilhouette:1126782376467513385>"
  ),
  atlanticPincerLobster: new FishyEmoji(
    "<:AtlanticPincerLobster:1126781869397123175>",
    "<:AtlanticPincerLobsterWater:1126782411078905866>",
    "<:aplSilhouette:1126782377407041598>"
  ),
  bandedSeaUrchin: new FishyEmoji(
    "<:BandedSeaUrchin:1126781862975647744>",
    "<:BandedSeaUrchinWater:1126782405680828447>",
    "<:bsuSilhouette:1126782372386443325>"
  ),
} satisfies Record<string, FishyEmoji>;
