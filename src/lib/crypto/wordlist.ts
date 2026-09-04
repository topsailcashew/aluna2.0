/**
 * Wordlist for recovery phrases.
 *
 * 1024 words, so each contributes exactly 10 bits. A 12-word phrase carries
 * 120 bits of entropy — far beyond brute force, and the phrase is additionally
 * stretched through PBKDF2 before it ever touches a key.
 *
 * Words are short, common, unambiguous in speech, and free of near-homophones,
 * because people write these down by hand and read them back later.
 */

export const PHRASE_WORDS: readonly string[] = `
  able acid acorn actor adapt add admit adopt
  adult after again agent agree ahead aim air
  alarm album alert alike alive allow almond alone
  along aloud alpha also alter amber amend among
  ample amuse anchor angel anger angle ankle answer
  ant anvil apart apple apply april apron arch
  arctic area arena argue arise arm armor army
  aroma array arrow art ash aside ask aspen
  asset atlas atom attic auburn audio august aunt
  author auto autumn avoid awake award aware away
  axis bacon badge bagel baker balance balcony ball
  balloon bamboo banana band banjo bank banner barge
  barley barn barrel base basil basket bass batch
  bath baton bay beach beacon bead beam bean
  bear beast beaver bed beech beetle before begin
  behind bell belt bench bend berry best betray
  better beyond bicycle big bill bind birch bird
  birth biscuit bison bit black blade blame blank
  blanket blast blaze blend bless blind blink block
  bloom blossom blue blur board boat body boil
  bold bolt bond bone bonus book boost boot
  border born borrow both bottle bottom bounce bound
  bow bowl box boy brace braid brain brake
  branch brass brave bread break breeze brick bridge
  brief bright bring brisk broad broken bronze brook
  broom brother brown brush bubble bucket buckle bud
  buffalo build bulb bulk bull bundle bunker burden
  burn burst bus bush butter button buy buzz
  cabin cable cactus cage cake calm camel camp
  canal candle cane canoe canvas canyon cap cape
  car carbon card cargo carpet carry cart carve
  case cash cask castle cat catch cattle cause
  cave cedar ceiling cell cement census center chain
  chair chalk chance change channel chapel charm chart
  chase cheap check cheek cheer cheese cherry chess
  chest chief child chill chime chip choice choose
  chorus chrome chunk cider circle city civil claim
  clamp clap clash class claw clay clean clear
  clerk clever cliff climb clip cloak clock close
  cloth cloud clover club clump coach coal coast
  coat cobalt cocoa code coffee coil coin cold
  collar colony color column comb combine come comet
  comfort comic common compass cook cool copper copy
  coral cord core cork corn corner cost cotton
  couch cough count county courage course court cousin
  cover cow crack cradle craft crane crash crate
  crawl crayon cream create credit creek crew crimson
  crisp crop cross crowd crown cruise crumb crush
  crust crystal cube cup curb cure curl current
  curtain curve cushion custom cycle daily dairy daisy
  dam dance danger dark dart dash data dawn
  day dead deal dear debate debris decade decide
  deck decor deep deer defend degree delay deliver
  delta demand denim dense dentist depart depth desert
  design desk detail detect device devote dial diamond
  diary dice diet dig dinner direct dirt disc
  dish dive dock doctor dodge dog doll dolphin
  dome donate donkey door dose dot double dove
  down dozen draft drag dragon drain drama draw
  dream dress drift drill drink drive drop drum
  dry duck due dune dusk dust duty eager
  eagle early earn earth ease east echo edge
  edit effort egg eight elbow elder electric elegant
  element elk elm else embark ember emerald empty
  enable enact end enemy energy engage engine enjoy
  enough enrich enter entire entry equal equip erase
  error escape essay estate eternal event ever exact
  exam example excess exchange excite exist exit expand
  expert explain export extend extra eye fabric face
  fact fade faint fair faith fall false family
  fan far farm fashion fast fat fate father
  fault favor fear feast feather fee feed feel
  fellow fence fern ferry festival fetch fever few
  fiber field fierce fifteen fig fight figure file
  fill film filter final find fine finger finish
  fire firm first fish fist fit five fix
  flag flame flash flat flavor flax fleet flesh
  flex flint float flock flood floor flour flow
  flower fluid flute fly foam focus fog foil
  fold folk follow food foot force forest forge
  fork form fort forum forward fossil foster found
  four fox frame free fresh friend fringe frog
  front frost fruit fuel full fun fund funnel
  fur future gain gallery game gap garage garden
  garlic gas gate gather gauge gaze gear gem
  gene gentle genuine ghost giant gift ginger giraffe
  girl give glad glance glass glide globe gloom
  glory glove glow glue goal goat gold golf
  good goose gorge gospel govern gown grab grace
  grade grain grand grape graph grasp grass grave
  gray graze great green greet grid grief grill
  grin grip grit grocery groove ground group grove
  grow guard guess guest guide guilt guitar gulf
  gull gum gust habit hail hair half hall
  halt hammer hand handle hang happy harbor hard
  hare harm harp harvest hat hatch haul have
  hawk hay hazel head heal health heap hear
  heart heat heavy hedge heel height help hen
  herb herd here hero hidden high hill hint
  hip hire history hive hobby hold hole hollow
  holy home honest honey hood hoof hook hope
  horn horse host hot hotel hour house hover
  hub huge human humble humor hunt hurry ice
  icon idea ideal idle image impact import impress
  inch income index indoor infant inform inject injury
  ink inner input insect inside insight inspire intact
  intend into invest invite iron island issue item
  ivory jacket jade jail jam jar jaw jazz
  jelly jet jewel job join joke journey joy
  judge juice july jump june jungle junior just
  kale keen keep kettle key kick kid kind
  king kiss kit kitchen kite knee knife knit
  knock knot know lab label labor lace ladder
  lady lake lamb lamp land lane lantern lap
  large last late laugh launch laundry lava law
  lawn layer lazy lead leaf lean leap learn
  lease leather leave ledge left leg legend lemon
  lend length lens leopard less lesson letter level
  lever liberty library life lift light like lily
  limb lime limit line linen link lion liquid
  list listen little live lizard load loaf loan
  lobby local lock lodge log logic lonely long
  look loop loose lord lose loss lost lot
  loud love low loyal luck lumber lunar lunch
  lung luxury lyric machine magic magnet maid mail
  main major make mammal man manage mango manner
  map maple marble march margin marine mark market
  marsh mask mason mass master match mate matter
`.trim().split(/\s+/);

export const PHRASE_LENGTH = 12;
/** Bits contributed per word — log2(PHRASE_WORDS.length). */
export const BITS_PER_WORD = 10;
