/* =========================================================================
   Grand Line Voyage — series metadata
   Seasons follow the Japanese home-video "season" groupings used by Toei /
   Wikipedia. Arc ranges, episode types and debut episodes follow common
   fan-community conventions and are best-effort.
   ========================================================================= */

window.OP_META = (function () {

  const SEASONS = [
    { n: 1,  title: "East Blue", short: "East Blue", start: 1, end: 61, years: "1999–2001", color: "#3fa7d6",
      blurb: "A rubber-limbed boy in a straw hat sets out from a tiny village to become King of the Pirates, gathering his first crewmates across the weakest of the four seas." },
    { n: 2,  title: "Entering into the Grand Line", short: "Grand Line", start: 62, end: 77, years: "2001", color: "#5c7cfa",
      blurb: "The crew climbs Reverse Mountain into the most dangerous sea in the world and stumbles into the schemes of a secret criminal syndicate." },
    { n: 3,  title: "Introducing Chopper at the Winter Island", short: "Winter Island", start: 78, end: 92, years: "2001", color: "#9ad1f5",
      blurb: "With their navigator gravely ill, the crew lands on a snowbound kingdom without doctors and meets a very unusual reindeer." },
    { n: 4,  title: "Alabasta", short: "Alabasta", start: 93, end: 130, years: "2001–2002", color: "#e0a458",
      blurb: "A desert kingdom on the brink of civil war, a princess racing to save her people, and the war that will define the early Grand Line." },
    { n: 5,  title: "Dreams!, The Zenny Pirate Crew Sortie!, Beyond the Rainbow", short: "Dreams & Rainbows", start: 131, end: 143, years: "2002–2003", color: "#c77dff",
      blurb: "An anime-original breather: crew backstories, a money-lending goat pirate, and a mysterious rainbow mist." },
    { n: 6,  title: "Sky Island ~ Skypiea & The Golden Bell", short: "Skypiea", start: 144, end: 195, years: "2003–2004", color: "#ffd166",
      blurb: "A city of mockers, a ride on a geyser to the sky, and an island of clouds ruled by a self-proclaimed god." },
    { n: 7,  title: "Escape! The Marine Fortress & The Foxy Pirate Crew", short: "Marine Fortress & Foxy", start: 196, end: 228, years: "2004–2005", color: "#ef476f",
      blurb: "A daring escape from a Marine base, a pirate game show of a duel, and an Admiral who changes the mood entirely." },
    { n: 8,  title: "Water Seven", short: "Water 7", start: 229, end: 263, years: "2005–2006", color: "#118ab2",
      blurb: "The City of Water, home of the world's best shipwrights — where the crew faces its hardest internal test yet." },
    { n: 9,  title: "Enies Lobby", short: "Enies Lobby", start: 264, end: 336, years: "2006–2007", color: "#073b4c",
      blurb: "An all-out assault on the World Government's island of justice. Considered by many to be among the very best in the series." },
    { n: 10, title: "Thriller Bark", short: "Thriller Bark", start: 337, end: 381, years: "2008", color: "#6a4c93",
      blurb: "A ghost ship, a gentleman skeleton, and an enormous haunted island in the Florian Triangle." },
    { n: 11, title: "Sabaody Archipelago", short: "Sabaody", start: 382, end: 407, years: "2008–2009", color: "#8ac926",
      blurb: "The halfway point of the Grand Line: bubbles, nobles, rival rookie captains and a fateful day on the archipelago." },
    { n: 12, title: "Island of Women", short: "Amazon Lily", start: 408, end: 421, years: "2009", color: "#ff70a6",
      blurb: "Stranded on an island where men are forbidden, ruled by the beautiful and fearsome Pirate Empress." },
    { n: 13, title: "Impel Down", short: "Impel Down", start: 422, end: 456, years: "2009–2010", color: "#9d0208",
      blurb: "A one-man break-in to the world's most secure underwater prison, level by hellish level." },
    { n: 14, title: "Marineford", short: "Marineford", start: 457, end: 516, years: "2010–2011", color: "#d00000",
      blurb: "The War of the Best — the biggest clash the world has seen — and the turning point of the entire series." },
    { n: 15, title: "Fishman Island", short: "Fishman Island", start: 517, end: 578, years: "2011–2012", color: "#00b4d8",
      blurb: "Two years later. The crew reunites, dives 10,000 meters under the sea, and enters the New World's doorstep." },
    { n: 16, title: "Punk Hazard", short: "Punk Hazard", start: 579, end: 628, years: "2013–2014", color: "#f77f00",
      blurb: "A burning-and-frozen island, kidnapped children, a mad scientist and a surprising alliance." },
    { n: 17, title: "Dressrosa", short: "Dressrosa", start: 629, end: 746, years: "2014–2016", color: "#e85d75",
      blurb: "A kingdom of love, passion and living toys, a colosseum tournament, and the dark secret beneath it all." },
    { n: 18, title: "Zou", short: "Zou", start: 747, end: 782, years: "2016–2017", color: "#80b918",
      blurb: "An island on the back of a thousand-year-old elephant, home of the Mink Tribe and a long-hidden history." },
    { n: 19, title: "Whole Cake Island", short: "Whole Cake", start: 783, end: 891, years: "2017–2019", color: "#ff8fab",
      blurb: "A rescue mission into the candy-coated territory of an Emperor of the Sea, crashing a wedding nobody wants." },
    { n: 20, title: "Wano Country", short: "Wano", start: 892, end: 1088, years: "2019–2023", color: "#c1121f",
      blurb: "The closed samurai nation, a twenty-year-old grudge and the biggest raid the series has ever attempted." },
    { n: 21, title: "Egghead", short: "Egghead", start: 1089, end: 1155, years: "2024–2025", color: "#4cc9f0",
      blurb: "The island of the future, the world's greatest scientist, and secrets the World Government would rather keep buried." },
    { n: 22, title: "Elbaph", short: "Elbaph", start: 1156, end: 1180, years: "2026–", color: "#a7c957", ongoing: true,
      blurb: "At long last, the Land of Giants. The first season under the anime's new seasonal broadcast format." }
  ];

  // Story arcs (anime). Listed in broadcast order; ranges may interleave.
  const ARCS = [
    [1, 3, "Romance Dawn"], [4, 8, "Orange Town"], [9, 17, "Syrup Village"], [18, 18, "Gaimon"],
    [19, 30, "Baratie"], [31, 44, "Arlong Park"], [45, 47, "Buggy's Crew Adventure"], [48, 53, "Loguetown"],
    [54, 61, "Warship Island"], [62, 63, "Reverse Mountain"], [64, 67, "Whisky Peak"],
    [68, 69, "Coby & Helmeppo"], [70, 77, "Little Garden"], [78, 91, "Drum Island"], [92, 130, "Alabasta"],
    [131, 135, "Post-Arabasta"], [136, 138, "Goat Island"], [139, 143, "Ruluka Island"],
    [144, 152, "Jaya"], [153, 195, "Skypiea"], [196, 206, "G-8"], [207, 219, "Long Ring Long Land"],
    [220, 224, "Ocean's Dream"], [225, 226, "Foxy's Return"], [227, 228, "Long Ring Long Land (Finale)"],
    [229, 263, "Water 7"], [264, 312, "Enies Lobby"], [313, 325, "Post-Enies Lobby"],
    [326, 335, "Ice Hunter"], [336, 336, "Chopperman Special"], [337, 381, "Thriller Bark"],
    [382, 384, "Spa Island"], [385, 405, "Sabaody Archipelago"], [406, 407, "Boss Luffy Special"],
    [408, 417, "Amazon Lily"], [418, 421, "Straw Hat's Separation Serial"], [422, 425, "Impel Down"],
    [426, 429, "Little East Blue"], [430, 452, "Impel Down"], [453, 456, "Straw Hat's Separation Serial"],
    [457, 489, "Marineford"], [490, 516, "Post-War"], [517, 522, "Return to Sabaody"],
    [523, 574, "Fish-Man Island"], [575, 578, "Z's Ambition"], [579, 625, "Punk Hazard"],
    [626, 628, "Caesar Retrieval"], [629, 746, "Dressrosa"], [747, 750, "Silver Mine"], [751, 779, "Zou"],
    [780, 782, "Marine Rookie"], [783, 877, "Whole Cake Island"], [878, 889, "Levely"],
    [890, 894, "Wano Country"], [895, 896, "Cidre Guild"], [897, 906, "Wano Country"],
    [907, 907, "Romance Dawn (20th Anniversary)"], [908, 1028, "Wano Country"], [1029, 1030, "Uta's Past"],
    [1031, 1085, "Wano Country"], [1086, 1155, "Egghead"], [1156, 1180, "Elbaph"]
  ];

  // Episode type ranges (anything not listed is canon).
  const FILLER = [[18,18],[46,47],[50,51],[54,61],[131,143],[196,206],[213,216],[220,226],[291,292],[303,303],
    [317,319],[326,336],[382,384],[406,407],[426,429],[492,492],[542,542],[575,578],[590,590],[626,628],
    [747,750],[780,782],[895,896],[907,907],[1029,1030]];
  const MIXED = [[45,45],[68,69],[98,99],[101,102]];
  const RECAP = [[129,129],[279,283],[457,458]];

  // Short, spoiler-light "why it matters" tags for landmark episodes.
  const HIGHLIGHTS = {
    1: "Series premiere — the voyage begins", 4: "Luffy's childhood with Shanks", 19: "Zoro's origin story",
    24: "A legendary swordsman appears", 37: "A defining emotional peak of East Blue", 45: "The crew's first bounty",
    48: "The town where it all began — and ended", 62: "Entering the Grand Line", 91: "Fan-favorite Drum Island finale",
    126: "Alabasta's climax", 195: "Skypiea finale", 278: "One of the most iconic scenes in anime",
    312: "A farewell fans never forget — bring tissues", 320: "Bounties for everyone", 381: "Thriller Bark finale",
    405: "A turning point for the crew", 483: "The pivotal moment of Marineford", 516: "End of the first half",
    517: "The second half begins", 629: "Dressrosa begins", 726: "A major new power-up", 808: "Fan-favorite Whole Cake confrontation",
    871: "Climax of a fan-favorite duel", 892: "Wano begins — a major animation upgrade", 907: "20th anniversary special",
    958: "A legendary flashback battle", 1000: "Episode 1000!", 1015: "Fan-favorite rooftop moment",
    1062: "A fan-favorite duel's climax", 1071: "A series-defining moment", 1085: "Wano finale",
    1089: "Egghead begins", 1136: "Acclaimed flashback finale", 1155: "Egghead finale",
    1156: "Elbaph premiere — new seasonal format", 1163: "An acclaimed reunion", 1180: "Final episode of 2026 — returns in 2027"
  };

  // Straw Hat join points (episode after which the character is officially aboard).
  const CREW_JOINS = [
    { id: "luffy", name: "Monkey D. Luffy", role: "Captain", ep: 1 },
    { id: "zoro", name: "Roronoa Zoro", role: "Swordsman", ep: 3 },
    { id: "usopp", name: "Usopp", role: "Sniper", ep: 17 },
    { id: "sanji", name: "Sanji", role: "Cook", ep: 30 },
    { id: "nami", name: "Nami", role: "Navigator", ep: 44 },
    { id: "chopper", name: "Tony Tony Chopper", role: "Doctor", ep: 91 },
    { id: "robin", name: "Nico Robin", role: "Archaeologist", ep: 130 },
    { id: "franky", name: "Franky", role: "Shipwright", ep: 322 },
    { id: "brook", name: "Brook", role: "Musician", ep: 381 },
    { id: "jinbe", name: "Jinbe", role: "Helmsman", ep: 981 }
  ];

  /* Character guide.
     ep   = first anime appearance (best-effort)
     g    = filter group, joins = becomes a Straw Hat at this episode
     Bios are written to be safe at the point the character is introduced. */
  const C = (ep, id, name, epithet, g, aff, df, bio, joins) => ({ ep, id, name, epithet, g, aff, df, bio, joins });
  const CHARACTERS = [
    // ---- Season 1: East Blue
    C(1, "roger", "Gol D. Roger", "King of the Pirates", "Legend", "Roger Pirates", "", "The legendary pirate whose final words at his execution launched the Great Pirate Era and sent the world chasing his treasure, the One Piece."),
    C(1, "luffy", "Monkey D. Luffy", "Straw Hat", "Straw Hat", "Straw Hat Pirates — Captain", "Gum-Gum Fruit", "A rubber-bodied, endlessly hungry and endlessly optimistic boy who sets out to sea to find the One Piece and become King of the Pirates.", 1),
    C(1, "alvida", "Alvida", "Iron Mace", "Pirate", "Alvida Pirates — Captain", "", "A vain, club-swinging pirate captain who rules her crew through fear — the very first villain Luffy runs into."),
    C(1, "nami", "Nami", "Cat Burglar", "Straw Hat", "Independent thief", "", "A gifted navigator and thief who only steals from pirates, with a mysterious reason for needing so much money.", 44),
    C(1, "koby", "Koby", "", "Marine", "Alvida Pirates (cabin boy)", "", "A timid cabin boy trapped serving Alvida who secretly dreams of joining the Marines. Luffy's first friend on the voyage."),
    C(2, "zoro", "Roronoa Zoro", "Pirate Hunter", "Straw Hat", "Bounty hunter", "", "A fearsome three-sword-style swordsman held captive at a Marine base, chasing a promise to become the world's greatest swordsman.", 3),
    C(2, "helmeppo", "Helmeppo", "", "Marine", "Marines (Shells Town)", "", "The spoiled, cowardly son of the local Marine captain who throws his father's name around."),
    C(2, "morgan", "Axe-Hand Morgan", "Axe-Hand", "Marine", "Marines — Captain", "", "A tyrannical Marine captain with an axe for a hand who rules Shells Town through intimidation."),
    C(2, "rika", "Rika", "", "Civilian", "Shells Town", "", "A brave little girl who sneaks rice balls to the captive Zoro."),
    C(4, "shanks", "Shanks", "Red-Haired", "Pirate", "Red-Haired Pirates — Captain", "", "The easygoing pirate captain who inspired young Luffy — and left him his treasured straw hat."),
    C(4, "makino", "Makino", "", "Civilian", "Windmill Village", "", "The kind barkeep of Luffy's hometown who looked after him as a child."),
    C(4, "beckman", "Benn Beckman", "", "Pirate", "Red-Haired Pirates — First Mate", "", "Shanks' sharp, unflappable, rifle-carrying first mate."),
    C(4, "yasopp", "Yasopp", "", "Pirate", "Red-Haired Pirates — Sniper", "", "The crew's legendary marksman. Remember the name."),
    C(4, "higuma", "Higuma", "", "Antagonist", "Mountain Bandits", "", "A smug mountain bandit whose run-in with Shanks' crew changes young Luffy's life."),
    C(4, "buggy", "Buggy", "the Clown", "Pirate", "Buggy Pirates — Captain", "Chop-Chop Fruit", "A flamboyant, short-tempered clown pirate who can split his body into floating pieces — and who really hates people mentioning his nose."),
    C(4, "mohji", "Mohji", "Beast Tamer", "Pirate", "Buggy Pirates", "", "Buggy's officer who commands Richie, an enormous lion."),
    C(5, "boodle", "Boodle", "", "Civilian", "Orange Town — Mayor", "", "The stubborn old mayor of Orange Town who refuses to let pirates take his town."),
    C(5, "chouchou", "Chouchou", "", "Civilian", "Orange Town", "", "A loyal little dog guarding his late owner's pet shop, no matter what."),
    C(6, "cabaji", "Cabaji", "the Acrobat", "Pirate", "Buggy Pirates — Chief of Staff", "", "A unicycling swordsman and Buggy's right-hand man."),
    C(9, "usopp", "Usopp", "Captain Usopp", "Straw Hat", "Usopp Pirates — Captain", "", "A long-nosed teller of tall tales from Syrup Village with a slingshot, a big imagination and a dream of becoming a brave warrior of the sea.", 17),
    C(9, "kaya", "Kaya", "", "Civilian", "Syrup Village", "", "A sickly, kind-hearted heiress whom Usopp visits every day to cheer up with his stories."),
    C(9, "klahadore", "Klahadore", "", "Civilian", "Kaya's household — Butler", "", "Kaya's prim, glasses-pushing butler, who has no patience for Usopp."),
    C(9, "merry", "Merry", "", "Civilian", "Kaya's household — Steward", "", "Kaya's gentle steward, with a fondness for designing ships."),
    C(9, "usopp-pirates", "Ninjin, Piiman & Tamanegi", "The Usopp Pirates", "Civilian", "Syrup Village", "", "Three village kids who follow 'Captain' Usopp everywhere."),
    C(10, "jango", "Jango", "the Hypnotist", "Pirate", "Black Cat Pirates", "", "A moonwalking hypnotist armed with a chakram."),
    C(12, "nyaban", "Sham & Buchi", "The Nyaban Brothers", "Pirate", "Black Cat Pirates", "", "The cat-clawed officer duo of the Black Cat Pirates."),
    C(18, "gaimon", "Gaimon", "", "Civilian", "Island of Rare Animals", "", "A man stuck inside a treasure chest who guards an island of strange animals (anime-original episode)."),
    C(19, "kuina", "Kuina", "", "Civilian", "Shimotsuki Village dojo", "", "Zoro's childhood rival at the dojo, and the root of his greatest promise."),
    C(19, "koshiro", "Koshiro", "", "Civilian", "Shimotsuki Village dojo — Master", "", "The mild-mannered master of Zoro's childhood dojo."),
    C(19, "johnny-yosaku", "Johnny & Yosaku", "", "Ally", "Bounty hunters", "", "A pair of bounty hunters who idolize Zoro as their 'big bro'."),
    C(20, "sanji", "Sanji", "Black Leg", "Straw Hat", "Baratie — Sous-Chef", "", "The hot-headed, chivalrous, flirtatious sous-chef of the Baratie who fights only with his legs to protect his cook's hands.", 30),
    C(20, "zeff", "Zeff", "Red-Leg", "Ally", "Baratie — Owner", "", "The peg-legged former pirate who runs the Baratie floating restaurant."),
    C(20, "fullbody", "Fullbody", "Ironfist", "Marine", "Marines — Lieutenant", "", "An arrogant Marine lieutenant who picks the wrong fight at the Baratie."),
    C(20, "gin", "Gin", "Man-Demon", "Pirate", "Krieg Pirates", "", "A starving pirate fed by Sanji, torn between gratitude and loyalty to his captain."),
    C(20, "patty-carne", "Patty & Carne", "", "Civilian", "Baratie — Cooks", "", "Brawling cooks of the Baratie who can fight off pirates between orders."),
    C(22, "krieg", "Don Krieg", "", "Pirate", "Krieg Pirate Armada — Admiral", "", "The armored, treacherous admiral of East Blue's largest pirate fleet."),
    C(23, "mihawk", "Dracule Mihawk", "Hawk-Eyes", "Pirate", "Seven Warlords of the Sea", "", "The world's greatest swordsman — the very title Zoro has sworn to claim."),
    C(25, "pearl", "Pearl", "the Iron Wall", "Pirate", "Krieg Pirates", "", "A shield-clad brawler who claims he's never been hurt in a fight."),
    C(31, "arlong", "Arlong", "Saw-Tooth", "Antagonist", "Arlong Pirates — Captain", "", "A sawshark fish-man who believes fish-men are superior, and rules over the villages of Nami's home island."),
    C(31, "hatchan", "Hatchan", "Hachi", "Pirate", "Arlong Pirates", "", "A six-armed octopus fish-man swordsman, far friendlier than his crewmates."),
    C(31, "kuroobi-chew", "Kuroobi & Chew", "", "Pirate", "Arlong Pirates", "", "Arlong's fish-man officers: a manta-ray karate master and a water-spitting gourami."),
    C(32, "nojiko", "Nojiko", "", "Civilian", "Cocoyashi Village", "", "Nami's adoptive older sister, who tends the family's tangerine grove."),
    C(32, "genzo", "Genzo", "", "Civilian", "Cocoyashi Village — Sheriff", "", "The scarred village sheriff with a pinwheel on his hat, quietly protective of Nami."),
    C(32, "nezumi", "Nezumi", "", "Marine", "Marines — Captain", "", "A corrupt, rat-faced Marine captain."),
    C(35, "bellemere", "Bell-mère", "", "Civilian", "Cocoyashi Village", "", "A former Marine and the beloved adoptive mother of Nami and Nojiko."),
    C(48, "smoker", "Smoker", "White Hunter", "Marine", "Marines — Captain", "Smoke-Smoke Fruit", "A cigar-chomping Marine captain who hunts pirates by his own rules."),
    C(49, "tashigi", "Tashigi", "", "Marine", "Marines — Master Chief Petty Officer", "", "A clumsy but dedicated sword-collecting Marine — with a face Zoro can't stand."),
    C(53, "dragon", "Monkey D. Dragon", "", "Revolutionary", "Unknown", "", "A mysterious cloaked man who appears in Loguetown with a storm."),
    C(54, "apis", "Apis", "", "Civilian", "Warship Island", "", "A girl who can talk to animals, at the heart of an anime-original adventure."),
    // ---- Season 2: Entering into the Grand Line
    C(62, "laboon", "Laboon", "", "Civilian", "Twin Capes", "", "An enormous whale who keeps ramming his head into the Red Line, waiting for someone."),
    C(62, "crocus", "Crocus", "", "Ally", "Twin Capes Lighthouse", "", "The eccentric lighthouse keeper and doctor who cares for Laboon."),
    C(62, "vivi", "Nefertari Vivi", "Miss Wednesday", "Royalty", "Baroque Works (agent)", "", "A blue-haired agent of a secret criminal syndicate, partnered with the bumbling Mr. 9."),
    C(62, "mr9", "Mr. 9", "", "Antagonist", "Baroque Works", "", "A bat-swinging, crown-wearing frontier agent of Baroque Works."),
    C(64, "igaram", "Igaram", "Mr. 8", "Antagonist", "Baroque Works", "", "The curly-haired, saxophone-gun-wielding mayor of Whisky Peak."),
    C(64, "karoo", "Karoo", "", "Ally", "Super Spot-Billed Duck Squad", "", "A super-fast, easily frightened spot-billed duck."),
    C(65, "mr5", "Mr. 5 & Miss Valentine", "", "Antagonist", "Baroque Works", "Bomb-Bomb Fruit / Kilo-Kilo Fruit", "Baroque Works' explosive officer agent and his weight-shifting partner."),
    C(67, "robin", "Nico Robin", "Miss All Sunday", "Straw Hat", "Baroque Works", "Flower-Flower Fruit", "The calm, enigmatic partner of Baroque Works' secret boss.", 130),
    C(68, "garp", "Monkey D. Garp", "the Fist", "Marine", "Marines — Vice Admiral", "", "A legendary Marine hero with a fierce 'fist of love' — and a surprising connection to Luffy."),
    C(70, "dorry-brogy", "Dorry & Brogy", "", "Giant", "Giant Warrior Pirates", "", "Two giant warriors from Elbaph locked in a century-long duel of honor on Little Garden."),
    C(72, "mr3", "Mr. 3", "", "Antagonist", "Baroque Works", "Wax-Wax Fruit", "A scheming Baroque Works agent who sculpts weapons and traps out of hard wax."),
    C(72, "goldenweek", "Miss Goldenweek", "", "Antagonist", "Baroque Works", "", "Mr. 3's tea-sipping partner, who paints hypnotic 'colors' onto her targets."),
    // ---- Season 3: Winter Island
    C(79, "wapol", "Wapol", "Tin Plate", "Antagonist", "Drum Kingdom — Former King", "Munch-Munch Fruit", "The tyrannical, eat-anything former king of Drum."),
    C(79, "dalton", "Dalton", "", "Ally", "Drum Kingdom", "Ox-Ox Fruit, Model: Bison", "A conscientious former guard captain of Drum who protects its people."),
    C(81, "chopper", "Tony Tony Chopper", "Cotton Candy Lover", "Straw Hat", "Drum Island", "Human-Human Fruit", "A blue-nosed reindeer who ate a Devil Fruit and now studies medicine high in the snowy Drum Rockies.", 91),
    C(81, "kureha", "Dr. Kureha", "Doctorine", "Ally", "Drum Island", "", "A 139-year-old, hard-drinking and frighteningly skilled doctor living atop the mountains."),
    C(85, "hiriluk", "Dr. Hiriluk", "", "Civilian", "Drum Island", "", "A 'quack' doctor with an unshakable dream of curing his country's heart."),
    C(92, "bonclay", "Bon Clay", "Mr. 2", "Antagonist", "Baroque Works", "Clone-Clone Fruit", "A ballet-dancing okama with a booming laugh, who can copy anyone's face with a touch."),
    // ---- Season 4: Alabasta
    C(93, "crocodile", "Crocodile", "Sir Crocodile", "Pirate", "Seven Warlords of the Sea", "Sand-Sand Fruit", "A Warlord of the Sea celebrated as the hero of Alabasta."),
    C(93, "cobra", "Nefertari Cobra", "", "Royalty", "Alabasta Kingdom — King", "", "The just king of Alabasta, whose land suffers under years of drought."),
    C(94, "ace", "Portgas D. Ace", "Fire Fist", "Pirate", "Whitebeard Pirates — 2nd Division Commander", "Flame-Flame Fruit", "A fiery, polite, narcoleptic pirate who comes looking for Luffy."),
    C(97, "toto", "Toto", "", "Civilian", "Yuba", "", "An old man digging tirelessly in the sand to bring water back to his oasis town."),
    C(100, "kohza", "Kohza", "", "Ally", "Alabasta Rebel Army — Leader", "", "Vivi's childhood friend, now leading the rebellion against the king."),
    C(103, "mr1", "Mr. 1 & Miss Doublefinger", "", "Antagonist", "Baroque Works", "Dice-Dice Fruit / Spike-Spike Fruit", "Baroque Works' top agents — a steel-bladed assassin and his spiked partner."),
    C(105, "pell", "Pell", "", "Royalty", "Alabasta Royal Guard", "Bird-Bird Fruit, Model: Falcon", "One of Alabasta's guardian deities, a falcon-man warrior."),
    // ---- Season 6: Skypiea
    C(144, "masira", "Masira", "", "Pirate", "Masira Pirates — Captain", "", "The self-proclaimed king of salvagers."),
    C(145, "shoujou", "Shoujou", "", "Pirate", "Shoujou Pirates — Captain", "", "A booming-voiced captain and king of undersea searching."),
    C(146, "bellamy", "Bellamy", "the Hyena", "Pirate", "Bellamy Pirates — Captain", "Spring-Spring Fruit", "A sneering rookie who mocks anyone who still dares to dream."),
    C(146, "teach", "Marshall D. Teach", "", "Pirate", "Unknown", "", "A gap-toothed, cherry-pie-loving pirate with big opinions about dreams."),
    C(147, "cricket", "Montblanc Cricket", "", "Ally", "Saruyama Alliance", "", "A treasure diver who believes in a 'liar's' legend about a city of gold."),
    C(148, "noland", "Montblanc Noland", "Noland the Liar", "Legend", "Lvneel Kingdom", "", "A famous explorer from a children's picture book, remembered as the world's greatest liar."),
    C(151, "doflamingo", "Donquixote Doflamingo", "Heavenly Demon", "Pirate", "Seven Warlords of the Sea", "", "A grinning, pink-feathered Warlord of the Sea."),
    C(151, "kuma", "Bartholomew Kuma", "the Tyrant", "Pirate", "Seven Warlords of the Sea", "", "A towering, Bible-carrying Warlord of very few words."),
    C(151, "whitebeard", "Edward Newgate", "Whitebeard", "Pirate", "Whitebeard Pirates — Captain", "", "One of the Four Emperors, called the strongest man in the world."),
    C(151, "sengoku", "Sengoku", "the Buddha", "Marine", "Marines — Fleet Admiral", "", "The Fleet Admiral of the Marines."),
    C(153, "ganfall", "Gan Fall", "Sky Knight", "Ally", "Skypiea", "", "An armored knight on a flying bird who rescues travelers in the sky for a small fee."),
    C(153, "conis", "Conis & Pagaya", "", "Civilian", "Angel Island", "", "A kind Skypiean girl and her father who welcome the crew to the sky."),
    C(158, "enel", "Enel", "God", "Antagonist", "Skypiea", "", "The self-proclaimed god of Skypiea who rules — and judges — from the Upper Yard."),
    C(164, "wyper", "Wyper", "War Demon", "Ally", "Shandia", "", "A fierce Shandian warrior fighting to reclaim his people's homeland."),
    C(164, "aisa", "Aisa", "", "Civilian", "Shandia", "", "A young Shandian girl who can hear the 'voices' of people."),
    C(187, "kalgara", "Kalgara", "", "Legend", "Shandora", "", "A great warrior of a lost city, whose story echoes four hundred years into the present."),
    // ---- Season 7: Marine Fortress & Foxy
    C(207, "foxy", "Foxy", "Silver Fox", "Pirate", "Foxy Pirates — Captain", "Slow-Slow Fruit", "A cheating, easily-depressed captain who challenges crews to the Davy Back Fight."),
    C(226, "aokiji", "Kuzan", "Aokiji", "Marine", "Marines — Admiral", "Ice-Ice Fruit", "A lazy-seeming Marine Admiral with a sleep mask — and one of the strongest people in the world."),
    // ---- Season 8: Water Seven
    C(229, "kokoro", "Kokoro & Chimney", "", "Civilian", "Water 7 — Shift Station", "", "A hard-drinking sea-train station master, her granddaughter, and Gonbe the rabbit-cat."),
    C(231, "iceberg", "Iceberg", "", "Civilian", "Water 7 — Mayor / Galley-La Company", "", "The mayor of Water 7 and president of the world's finest shipbuilding company."),
    C(231, "franky", "Franky", "Cutty Flam", "Straw Hat", "Franky Family — Boss", "", "A loud, speedo-wearing, cola-powered cyborg who runs a gang of ship dismantlers.", 322),
    C(231, "paulie", "Paulie", "", "Civilian", "Galley-La Company — Foreman", "", "A rope-wielding foreman who gambles too much and can't stand short skirts."),
    C(231, "kalifa", "Kalifa", "", "Civilian", "Galley-La Company — Secretary", "", "Iceberg's ultra-efficient secretary, who calls everything 'sexual harassment'."),
    C(232, "lucci", "Rob Lucci", "", "Civilian", "Galley-La Company", "", "A silent shipwright who talks through his pigeon, Hattori."),
    C(232, "kaku", "Kaku", "", "Civilian", "Galley-La Company", "", "A square-nosed, quick-footed shipwright."),
    C(248, "tom", "Tom", "", "Legend", "Tom's Workers", "", "A legendary fish-man shipwright who believed in taking responsibility for every ship he built."),
    C(249, "spandam", "Spandam", "", "World Government", "World Government", "", "A cowardly, ambitious government official with a grudge to settle."),
    // ---- Season 9: Enies Lobby
    C(275, "clover", "Professor Clover", "", "Legend", "Ohara", "", "The head of Ohara's great library of knowledge."),
    C(276, "olvia", "Nico Olvia", "", "Legend", "Ohara", "", "A fearless archaeologist from the island of scholars."),
    C(276, "saul", "Jaguar D. Saul", "", "Giant", "Former Marine Vice Admiral", "", "A laughing giant with a gentle heart who washes ashore on Ohara."),
    C(278, "akainu", "Sakazuki", "Akainu", "Marine", "Marines", "Magma-Magma Fruit", "A merciless Marine who embodies 'Absolute Justice'."),
    C(316, "marco", "Marco", "the Phoenix", "Pirate", "Whitebeard Pirates — 1st Division Commander", "", "Whitebeard's laid-back first division commander."),
    // ---- Season 10: Thriller Bark
    C(337, "brook", "Brook", "Humming", "Straw Hat", "Rumbar Pirates", "Revive-Revive Fruit", "A polite, joke-cracking, afro-sporting living skeleton found drifting alone on a ghost ship.", 381),
    C(340, "hogback", "Hogback", "", "Antagonist", "Thriller Bark", "", "A world-famous genius doctor with a nightmarish laboratory."),
    C(341, "absalom", "Absalom", "of the Graveyard", "Antagonist", "Thriller Bark", "Clear-Clear Fruit", "An invisible, lion-jawed creep with a wedding obsession."),
    C(343, "moria", "Gecko Moria", "", "Antagonist", "Seven Warlords of the Sea", "Shadow-Shadow Fruit", "The enormous, lazy Warlord who rules Thriller Bark and its army of zombies."),
    C(345, "perona", "Perona", "Ghost Princess", "Antagonist", "Thriller Bark", "Hollow-Hollow Fruit", "A gothic 'princess' whose ghosts drain your will to live."),
    C(350, "oars", "Oars", "", "Antagonist", "Thriller Bark", "", "A colossal legendary giant, returned as a zombie."),
    C(362, "ryuma", "Ryuma", "", "Legend", "Wano Country", "", "A legendary samurai swordsman from long ago."),
    // ---- Season 11: Sabaody
    C(385, "duval", "Duval", "Iron Mask", "Pirate", "Flying Fish Riders", "", "A masked rider hunting for a man who ruined his life — a man who looks a lot like Sanji's wanted poster."),
    C(387, "camie", "Camie & Pappag", "", "Civilian", "Fishman Island", "", "A cheerful kissing-gourami mermaid and her starfish fashion-designer friend."),
    C(390, "shakky", "Shakky", "", "Civilian", "Shakky's Rip-off Bar", "", "A sharp, unflappable bar owner who seems to know everything."),
    C(391, "charlos", "Saint Charlos", "", "World Government", "World Nobles", "", "A cruel Celestial Dragon who believes he can own anyone he likes."),
    C(392, "law", "Trafalgar Law", "Surgeon of Death", "Pirate", "Heart Pirates — Captain", "Op-Op Fruit", "A calculating Supernova doctor-captain with a polar bear first mate."),
    C(392, "kid", "Eustass Kid", "Captain", "Pirate", "Kid Pirates — Captain", "", "A violent Supernova rookie with a bounty rivaling Luffy's."),
    C(392, "killer", "Killer", "Massacre Soldier", "Pirate", "Kid Pirates", "", "Kid's masked right-hand man."),
    C(392, "bonney", "Jewelry Bonney", "Big Eater", "Pirate", "Bonney Pirates — Captain", "", "A Supernova with an appetite that could rival Luffy's."),
    C(392, "hawkins", "Basil Hawkins", "the Magician", "Pirate", "Hawkins Pirates — Captain", "", "A calm Supernova who reads fortunes in tarot cards."),
    C(392, "bege", "Capone Bege", "Gang", "Pirate", "Fire Tank Pirates — Captain", "", "A mafia-style Supernova with a big cigar."),
    C(392, "drake", "X Drake", "Red Flag", "Pirate", "Drake Pirates — Captain", "", "A former Marine turned Supernova."),
    C(396, "rayleigh", "Silvers Rayleigh", "", "Legend", "Sabaody Archipelago", "", "A gentle old ship-coater with a mysterious, legendary past."),
    C(398, "kizaru", "Borsalino", "Kizaru", "Marine", "Marines — Admiral", "Glint-Glint Fruit", "A languid Admiral who can move at the speed of light."),
    C(403, "sentomaru", "Sentomaru", "", "Marine", "Marine Science Unit", "", "An axe-carrying bodyguard with 'the world's greatest defense'."),
    // ---- Season 12: Amazon Lily
    C(408, "margaret", "Margaret", "", "Civilian", "Kuja", "", "A Kuja warrior who finds Luffy on the island where men are forbidden."),
    C(409, "nyon", "Gloriosa", "Elder Nyon", "Civilian", "Amazon Lily — Elder", "", "Amazon Lily's tiny, wise elder."),
    C(410, "hancock", "Boa Hancock", "Pirate Empress", "Pirate", "Kuja Pirates / Seven Warlords", "Love-Love Fruit", "The stunning, imperious Empress of Amazon Lily — whose beauty literally turns people to stone."),
    C(410, "gorgon", "Boa Sandersonia & Marigold", "", "Pirate", "Kuja Pirates", "Snake-Snake Fruits", "Hancock's powerful sisters."),
    // ---- Season 13: Impel Down
    C(422, "hannyabal", "Hannyabal", "", "World Government", "Impel Down — Vice Warden", "", "An ambitious vice warden who wants the top job."),
    C(425, "magellan", "Magellan", "", "World Government", "Impel Down — Chief Warden", "Venom-Venom Fruit", "The poison-wielding warden of the great underwater prison."),
    C(430, "jinbe", "Jinbe", "Knight of the Sea", "Straw Hat", "Sun Pirates / Seven Warlords", "", "An honorable whale shark fish-man, master of Fish-Man Karate and a Warlord of the Sea.", 981),
    C(438, "ivankov", "Emporio Ivankov", "Queen of the Kamabakka Kingdom", "Revolutionary", "Impel Down (secret level)", "Horm-Horm Fruit", "A flamboyant miracle-worker hiding on a secret level of Impel Down."),
    C(445, "shiryu", "Shiryu", "of the Rain", "World Government", "Impel Down — Former Head Jailer", "", "A ruthless swordsman sealed away on the deepest level."),
    // ---- Season 14: Marineford
    C(493, "dadan", "Curly Dadan", "", "Civilian", "Dadan Family — Boss", "", "A mountain bandit boss who never asked to raise any children."),
    C(494, "sabo", "Sabo", "", "Civilian", "Goa Kingdom", "", "A top-hatted boy from the Gray Terminal with dreams of the open sea."),
    // ---- Season 15: Fishman Island
    C(529, "shyarly", "Madam Shyarly", "", "Civilian", "Mermaid Cafe", "", "The fortune-telling mermaid owner of the Mermaid Cafe."),
    C(529, "fukaboshi", "Fukaboshi", "", "Royalty", "Ryugu Kingdom — Prince", "", "The eldest prince of Fishman Island."),
    C(530, "neptune", "Neptune", "", "Royalty", "Ryugu Kingdom — King", "", "The booming, kind-hearted king of Fishman Island."),
    C(530, "decken", "Vander Decken IX", "", "Antagonist", "Flying Pirates — Captain", "Mark-Mark Fruit", "A cursed captain obsessed with marrying a princess."),
    C(532, "shirahoshi", "Shirahoshi", "", "Royalty", "Ryugu Kingdom — Princess", "", "A giant, gentle crybaby mermaid princess kept locked away in a tower."),
    C(533, "hody", "Hody Jones", "", "Antagonist", "New Fish-Man Pirates — Captain", "", "A great white shark fish-man consumed by hatred for humans."),
    C(540, "tiger", "Fisher Tiger", "", "Legend", "Sun Pirates", "", "A legendary fish-man adventurer remembered as a hero."),
    C(545, "otohime", "Otohime", "", "Royalty", "Ryugu Kingdom — Queen", "", "The late queen who dreamed of fish-men and humans living together."),
    C(571, "bigmom", "Charlotte Linlin", "Big Mom", "Pirate", "Big Mom Pirates / Four Emperors", "", "A sweets-obsessed Emperor of the Sea with a very large family."),
    // ---- Season 16: Punk Hazard
    C(581, "kinemon", "Kin'emon", "Foxfire", "Ally", "Wano Country", "", "A samurai from the closed country of Wano who arrives in a rather unusual condition."),
    C(589, "caesar", "Caesar Clown", "Master", "Antagonist", "Punk Hazard", "Gas-Gas Fruit", "A mad scientist with a gleeful laugh and a laboratory full of secrets."),
    C(589, "monet", "Monet", "", "Antagonist", "Punk Hazard", "Snow-Snow Fruit", "Caesar's harpy-winged secretary."),
    C(599, "vergo", "Vergo", "Demon Bamboo", "Marine", "Marines G-5 — Vice Admiral", "", "A composed vice admiral who never notices food on his face."),
    C(611, "momo", "Kozuki Momonosuke", "", "Royalty", "Wano Country", "", "A small boy from Wano with a big secret."),
    // ---- Season 17: Dressrosa
    C(632, "violet", "Violet", "", "Civilian", "Dressrosa", "", "A passionate dancer who seems to know more than she lets on."),
    C(632, "rebecca", "Rebecca", "", "Civilian", "Corrida Colosseum", "", "An undefeated gladiator who refuses to hurt her opponents."),
    C(634, "cavendish", "Cavendish", "of the White Horse", "Pirate", "Beautiful Pirates — Captain", "", "A vain, gorgeous rookie who hates Luffy for stealing his spotlight."),
    C(636, "bartolomeo", "Bartolomeo", "the Cannibal", "Pirate", "Barto Club — Captain", "Barrier-Barrier Fruit", "A punk rookie captain — and Luffy's most devoted superfan."),
    C(641, "leo", "Leo", "", "Ally", "Tontatta Kingdom", "Stitch-Stitch Fruit", "The brave leader of a tribe of tiny dwarves."),
    C(642, "sugar", "Sugar", "", "Antagonist", "Donquixote Family", "Hobby-Hobby Fruit", "A grape-eating girl with a terrifying touch."),
    C(643, "fujitora", "Issho", "Fujitora", "Marine", "Marines — Admiral", "Press-Press Fruit", "A blind Admiral who gambles on fate and doesn't care for the old ways."),
    C(646, "chinjao", "Don Chinjao", "", "Pirate", "Happo Navy", "", "A legendary old pirate with a grudge against Garp's family."),
    C(651, "soldier", "The One-Legged Toy Soldier", "", "Ally", "Dressrosa", "", "A heroic one-legged toy soldier who protects Rebecca."),
    C(668, "diamante", "Diamante", "", "Antagonist", "Donquixote Family", "Flutter-Flutter Fruit", "The towering hero of the Colosseum."),
    C(739, "kaido", "Kaido", "King of the Beasts", "Pirate", "Beasts Pirates / Four Emperors", "", "Called the strongest creature in the world — and nearly impossible to kill."),
    // ---- Season 18: Zou
    C(751, "zunesha", "Zunesha", "", "Legend", "Zou", "", "A thousand-year-old elephant who carries an entire island on its back."),
    C(753, "carrot", "Carrot", "", "Ally", "Mink Tribe", "", "A bouncy, curious rabbit mink warrior."),
    C(753, "wanda", "Wanda", "", "Ally", "Mink Tribe", "", "A loyal dog mink warrior."),
    C(757, "jack", "Jack", "the Drought", "Pirate", "Beasts Pirates", "", "One of Kaido's fearsome top officers."),
    C(758, "inuarashi", "Inuarashi", "Duke Dogstorm", "Royalty", "Mokomo Dukedom — King of the Day", "", "The dog mink who rules Zou by day."),
    C(759, "nekomamushi", "Nekomamushi", "Master Cat Viper", "Royalty", "Mokomo Dukedom — King of the Night", "", "The cat mink who rules Zou by night."),
    C(761, "pedro", "Pedro", "", "Ally", "Guardians — Captain", "", "A one-eyed jaguar mink and captain of the Guardians."),
    C(768, "raizo", "Raizo", "of the Mist", "Ally", "Wano Country", "", "A ninja from Wano."),
    // ---- Season 19: Whole Cake Island
    C(784, "reiju", "Vinsmoke Reiju", "", "Royalty", "Germa Kingdom", "", "The eldest child of the Vinsmoke family."),
    C(787, "pudding", "Charlotte Pudding", "", "Pirate", "Big Mom Pirates", "", "Big Mom's sweet, three-eyed daughter — and Sanji's bride-to-be."),
    C(793, "judge", "Vinsmoke Judge", "", "Royalty", "Germa Kingdom — King", "", "The cold ruler of the seafaring kingdom of Germa."),
    C(797, "cracker", "Charlotte Cracker", "Thousand Arms", "Pirate", "Big Mom Pirates — Sweet Commander", "Bis-Bis Fruit", "One of Big Mom's Sweet Commanders, with an endless supply of biscuit soldiers."),
    C(851, "katakuri", "Charlotte Katakuri", "", "Pirate", "Big Mom Pirates — Sweet Commander", "Mochi-Mochi Fruit", "The strongest of Big Mom's Sweet Commanders, said never to have fallen."),
    C(859, "chiffon", "Charlotte Chiffon", "", "Pirate", "Fire Tank Pirates", "", "A defiant daughter of Big Mom."),
    // ---- Season 20: Wano Country
    C(893, "otama", "Otama", "", "Civilian", "Wano Country", "Millet-Millet Fruit", "A cheerful little girl in training to become a kunoichi."),
    C(902, "kiku", "Kikunojo", "Okiku", "Ally", "Wano Country", "", "A graceful swordswoman in a kimono with a sharp blade."),
    C(915, "king", "King", "the Wildfire", "Pirate", "Beasts Pirates — All-Star", "", "Kaido's masked right-hand man."),
    C(921, "komurasaki", "Komurasaki", "", "Civilian", "Wano Country — Courtesan", "", "The most beautiful courtesan in Wano."),
    C(922, "tonoyasu", "Tonoyasu", "", "Civilian", "Ebisu Town", "", "The always-smiling, much-loved man of Ebisu Town."),
    C(927, "orochi", "Kurozumi Orochi", "", "Antagonist", "Wano Country — Shogun", "", "The paranoid, snake-like shogun of Wano."),
    C(929, "hyogoro", "Hyogoro", "Old Man Hyo", "Ally", "Wano Country", "", "A frail old prisoner in the mines with surprising strength."),
    C(930, "queen", "Queen", "the Plague", "Pirate", "Beasts Pirates — All-Star", "", "A flashy, cyborg-enhanced performer of a villain."),
    C(960, "oden", "Kozuki Oden", "", "Legend", "Wano Country", "", "A wild, legendary samurai who couldn't stay inside his own country's borders."),
    C(990, "yamato", "Yamato", "", "Pirate", "Beasts Pirates", "", "Kaido's child, who dreams of becoming Kozuki Oden."),
    C(1029, "uta", "Uta", "", "Civilian", "Foosha Village (flashback)", "", "A childhood friend of Luffy's with a beautiful voice (anime-original tie-in to One Piece Film: Red)."),
    // ---- Season 21: Egghead
    C(1090, "lilith", "Vegapunk Lilith", "", "Civilian", "Egghead", "", "A mischievous young scientist who greets the crew on the island of the future."),
    C(1095, "vegapunk", "Dr. Vegapunk", "", "Civilian", "Egghead", "", "The world's greatest scientist, with a brain like no other."),
    C(1128, "saturn", "Jaygarcia Saturn", "", "World Government", "Five Elders", "", "One of the Five Elders who sit at the top of the World Government."),
    // ---- Season 22: Elbaph
    C(1160, "loki", "Loki", "the Accursed Prince", "Giant", "Elbaph — Prince", "", "Elbaph's chained, feared and reviled prince."),
    C(1166, "gunko", "Gunko", "", "World Government", "Holy Knights of God", "Arrow-Arrow Fruit", "A Holy Knight of God sent to Elbaph."),
    C(1167, "shamrock", "Figarland Shamrock", "", "World Government", "Holy Knights of God — Commander", "", "The commander of the Holy Knights — with a face that looks very familiar."),
    C(1169, "gaban", "Scopper Gaban", "the Mountain-Eater", "Legend", "Roger Pirates", "", "A legendary member of the Roger Pirates, long hidden among the giants.")
  ];

  // Non-canon side voyages (do NOT count toward 1999-series completion).
  const SIDE = [
    { id: "la", title: "Live Action (Netflix)", note: "Netflix's live-action adaptation. A separate continuity — not part of the 1999 anime.", items: [
      { id: "la1", group: "Season 1 — East Blue (2023-08-31)", list: ["Romance Dawn", "The Man in the Straw Hat", "Tell No Tales", "The Pirates Are Coming", "Eat at Baratie!", "The Chef and the Chore Boy", "The Girl with the Sawfish Tattoo", "Worst in the East"], mins: 60 },
      { id: "la2", group: "Season 2 — Into the Grand Line (2026-03-10)", list: ["The Beginning of the End", "Good Whale Hunting", "Whisky Business", "Big Trouble in Little Garden", "Wax On, Wax Off", "Nami Deerest", "Reindeer Shames", "Deer and Loathing in Drum Kingdom"], mins: 63 },
      { id: "la3", group: "Season 3 — in production", list: [], mins: 60 }
    ]},
    { id: "films", title: "Animated Films", note: "Theatrical films. Most are non-canon side stories; a few recap arcs or tie into the series.", items: [
      { id: "films", group: "Theatrical releases", mins: 90, list: [
        "One Piece: The Movie (2000)", "Clockwork Island Adventure (2001)", "Chopper's Kingdom on the Island of Strange Animals (2002)",
        "Dead End Adventure (2003)", "The Cursed Holy Sword (2004)", "Baron Omatsuri and the Secret Island (2005)",
        "The Giant Mechanical Soldier of Karakuri Castle (2006)", "Episode of Alabasta: The Desert Princess and the Pirates (2007)",
        "Episode of Chopper Plus: Bloom in the Winter, Miracle Cherry Blossom (2008)", "One Piece Film: Strong World (2009)",
        "Straw Hat Chase (2011)", "One Piece Film: Z (2012)", "One Piece Film: Gold (2016)", "One Piece: Stampede (2019)",
        "One Piece Film: Red (2022)"] }
    ]}
  ];


  // Manga chapters adapted by each story arc (by arc name). Anime-original arcs are omitted.
  const MANGA = {
    "Romance Dawn": [1, 7], "Orange Town": [8, 21], "Syrup Village": [22, 41], "Baratie": [42, 68],
    "Arlong Park": [69, 95], "Loguetown": [96, 100], "Reverse Mountain": [101, 105], "Whisky Peak": [106, 114],
    "Little Garden": [115, 129], "Drum Island": [130, 154], "Alabasta": [155, 217], "Jaya": [218, 236],
    "Skypiea": [237, 302], "Long Ring Long Land": [303, 321], "Long Ring Long Land (Finale)": [303, 321],
    "Water 7": [322, 374], "Enies Lobby": [375, 430], "Post-Enies Lobby": [431, 441], "Thriller Bark": [442, 489],
    "Sabaody Archipelago": [490, 513], "Amazon Lily": [514, 524], "Impel Down": [525, 549], "Marineford": [550, 580],
    "Post-War": [581, 597], "Return to Sabaody": [598, 602], "Fish-Man Island": [603, 653], "Punk Hazard": [654, 699],
    "Dressrosa": [700, 801], "Zou": [802, 824], "Whole Cake Island": [825, 902], "Levely": [903, 908],
    "Wano Country": [909, 1057], "Egghead": [1058, 1125], "Elbaph": [1126, null]
  };
  // Episodes that adapt exactly one chapter each (the 2026+ seasonal format): chapter = episode - offset.
  const ONE_TO_ONE = [{ from: 1156, offset: 30 }];
  // Cover-story / side-story arcs drawn from manga extras.
  const MANGA_NOTE = {
    "Buggy's Crew Adventure": "Adapted from Buggy's cover-page serial", "Coby & Helmeppo": "Expanded from Coby & Helmeppo's cover-page serial",
    "Straw Hat's Separation Serial": "Expanded from what the crew went through during the timeskip"
  };

  // Where to watch. Catalogs rotate by region, so these are live search links rather than fixed claims.
  const STREAMING = [
    { name: "Crunchyroll", note: "Full series, subtitled; most of it dubbed. New episodes simulcast.", url: "https://www.crunchyroll.com/search?q=one%20piece" },
    { name: "Netflix", note: "Selected seasons; varies by country.", url: "https://www.netflix.com/search?q=one%20piece" },
    { name: "Hulu (US)", note: "Large dubbed catalog that rotates.", url: "https://www.hulu.com/search?q=one%20piece" },
    { name: "JustWatch", note: "Check what's available in your country right now.", url: "https://www.justwatch.com/us/tv-show/one-piece" }
  ];

  return { MANGA, ONE_TO_ONE, MANGA_NOTE, STREAMING, SEASONS, ARCS, FILLER, MIXED, RECAP, HIGHLIGHTS, CREW_JOINS, CHARACTERS, SIDE };
})();
