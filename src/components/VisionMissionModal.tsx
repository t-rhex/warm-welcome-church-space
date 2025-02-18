import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const VisionMissionModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-6 sm:px-10 py-4 sm:py-5 bg-white text-church-800 rounded-full font-body hover:bg-church-100 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base">
          Our Vision & Mission
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-church-900">
            Our Vision & Mission & What We Believe
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-100px)] pr-4">
          <div className="space-y-8">
            {/* Vision and Mission Section */}
            <section>
              <p className="text-church-600 mb-4">
                We exist to lead people to Jesus Christ and the fullness of life
                he has for them. To know Jesus and Make Jesus Known.
              </p>
              <p className="text-church-600">
                <strong>EQUIP EMPOWER ENRICH.</strong> We exist to equip people
                with God's word, to empower community engagement, and enrich
                relationships with God and others.
              </p>
            </section>

            {/* What We Believe Section */}
            <section>
              <h3 className="text-xl font-display text-church-800 mb-4">
                What We Believe
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    THE SCRIPTURES
                  </h4>
                  <p className="text-church-600">
                    The Bible is the inspired Word of God, the product of holy
                    men of old who spoke and wrote as they were moved by the
                    Holy Spirit. The New Covenant, as recorded in the New
                    Testament, we accept as our infallible guide in matters
                    pertaining to conduct and doctrine. (2 Timothy 3:16; 2 Peter
                    1:21; 1 Thessalonians 2:13)
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    THE GOD HEAD
                  </h4>
                  <p className="text-church-600">
                    Our God is One but manifested in three persons—the Father,
                    the Son, and the Holy Spirit. God the Father is greater than
                    all, and He is the Source of the Word (Logos) and the
                    Begetter. The Son is the flesh-covered Word, the One
                    Begotten, and has existed with the Father from the
                    beginning. The Holy Spirit proceeds forth from both the
                    Father and the Son and is eternal.
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    THE GOD HEAD
                  </h4>
                  <p className="text-church-600">
                    Our God is One but manifested in three persons—the Father,
                    the Son, and the Holy Spirit. God the Father is greater than
                    all, and He is the Source of the Word (Logos) and the
                    Begetter. The Son is the flesh-covered Word, the One
                    Begotten, and has existed with the Father from the
                    beginning. The Holy Spirit proceeds forth from both the
                    Father and the Son and is eternal.
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    THE GOD HEAD
                  </h4>
                  <p className="text-church-600">
                    Our God is One but manifested in three persons—the Father,
                    the Son, and the Holy Spirit. God the Father is greater than
                    all, and He is the Source of the Word (Logos) and the
                    Begetter. The Son is the flesh-covered Word, the One
                    Begotten, and has existed with the Father from the
                    beginning. The Holy Spirit proceeds forth from both the
                    Father and the Son and is eternal.
                  </p>
                </div>

                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    THE GOD HEAD
                  </h4>
                  <p className="text-church-600">
                    Our God is One but manifested in three persons—the Father,
                    the Son, and the Holy Spirit. God the Father is greater than
                    all, and He is the Source of the Word (Logos) and the
                    Begetter. The Son is the flesh-covered Word, the One
                    Begotten, and has existed with the Father from the
                    beginning. The Holy Spirit proceeds forth from both the
                    Father and the Son and is eternal.
                  </p>
                </div>

                {/* Continue with other belief sections... */}
                <div>
                  <h4 className="font-display text-lg text-church-700 mb-2">
                    MAN, HIS FALL AND REDEMPTION
                  </h4>
                  <p className="text-church-600">
                    Man is a created being, made in the likeness and image of
                    God. But through Adam's transgression and fall, sin came
                    into the world. Jesus Christ, the Son of God, was manifested
                    to undo the work of the devil, and He gave His life and shed
                    His blood to redeem and restore man back to God.
                  </p>
                </div>

                {/* Add all other belief sections similarly */}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VisionMissionModal;
