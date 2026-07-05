/** A greeting-card template that can be printed on gato/entremet cakes. */
export interface CakeMessageTemplate {
  readonly id: string;
  readonly name: string;
  /** Physical print size shown to the user, e.g. "28×32mm". */
  readonly sizeLabel: string;
  /** CSS background of the card. */
  readonly background: string;
  /** Text (icing) color. */
  readonly ink: string;
  readonly fontFamily: string;
  readonly fontSize: string;
  /** Optional decorative motif rendered around the text. */
  readonly decor: 'none' | 'hearts' | 'confetti' | 'gold';
}

/** A saved greeting attached to one cart line. */
export interface CakeMessage {
  readonly cartItemId: string;
  readonly productName: string;
  readonly templateId: string;
  readonly text: string;
}
