// All imagery is bundled locally so it ships with any build/zip.
import batter from "../assets/batter.jpg";
import plainBatter from "../assets/plain-batter.jpg";
import ragiBatter from "../assets/ragi_batter.jpg";
import kambuBatter from "../assets/kambu.jpg";
import mappillaiBatter from "../assets/mapillai_samba.jpg";
import kavuniBatter from "../assets/karuppu_kavni.webp";
import karittuyanamBatter from "../assets/kattuyanam.jpg";
import cholamBatter from "../assets/Cholam_batter.jpg";
import rice from "../assets/rice.jpg";
import millets from "../assets/millets-bowls.png";
import grocery from "../assets/grocery.jpg";
import farm from "../assets/farm.jpg";
import manufacturing from "../assets/manufacturing.jpg";
import delivery from "../assets/delivery.jpg";
import stepSoaking from "../assets/step-soaking.png";
import stepGrinding from "../assets/step-grinding.png";
import stepPackaging from "../assets/step-packaging1.png";
import stepDelivery from "../assets/step-delivery.png";

export const PHOTOS = {
  paddyField: farm,
  farmerHands: farm,
  villageKitchen: manufacturing,
  handshake: delivery,

  batter,
  plainBatter,
  ragiBatter,
  kambuBatter,
  mappillaiBatter,
  kavuniBatter,
  karittuyanamBatter,
  cholamBatter,

  rice,
  millets,
  grocery,

  manufacturing,
  soaking: stepSoaking,
  grinding: stepGrinding,
  packaging: stepPackaging,
  delivery: stepDelivery,

  leaves: farm,
  wheat: rice,
  map: farm,
};
