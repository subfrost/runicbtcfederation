import { IndexPointer } from "metashrew-as/assembly/indexer/tables";
import { BSTU128 } from "metashrew-as/assembly/indexer/widebst";
export const DIVIDENDS_PAID = BSTU128.at(IndexPointer.for("/paid/"));
