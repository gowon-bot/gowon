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

export const FishyEmojiList = {
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
} satisfies Record<string, FishyEmoji>;
