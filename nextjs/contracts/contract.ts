import { GenericContractsDeclaration } from "../utils/contract";
import deployedContracts from "./deployedContracts";

export const contracts =
    deployedContracts as GenericContractsDeclaration | null;
