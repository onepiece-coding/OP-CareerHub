/**
 * @file src/components/ui/card/index.tsx
 */

import CardHeader from "./card-header";
import CardFooter from "./card-footer";
import CardBody from "./card-body";
import CardRoot from "./card-root";

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
