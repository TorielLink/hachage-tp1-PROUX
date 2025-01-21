import {readFile, writeFile} from 'node:fs/promises'
import {getDate, monSecret} from "./divers.js";
import {NotFoundError} from "./errors.js";
import {createHash} from 'node:crypto'
import {v4 as uuidv4} from "uuid";


/* Chemin de stockage des blocks */
const path = 'data/'

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */
export async function findBlocks() {
    const data = await readFile(path + "blockchain.json", "utf-8");
    return JSON.parse(data);
}

/**
 * Trouve un block à partir de son id
 * @param idBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(idBlock) {
    const blocks = await findBlocks();

    return blocks.filter(block => block.id === idBlock);
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    const blocks = await findBlocks();
    return blocks.length > 0 ? blocks[blocks.length - 1] : null;
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
export async function createBlock(contenu) {
    const blocs = await findBlocks()
    const dernierBloc = await findLastBlock();

    const hash = createHash("sha256");

    const nouveauBloc = {
        id: uuidv4(),
        timestamp: getDate(),
        nom: contenu.nom || "MysterieuxInconnu",
        don: contenu.don || 0,
        hash: ""
    };

    if (dernierBloc) {
        const strDernierBloc = JSON.stringify(dernierBloc);
        nouveauBloc.hash = hash.update(strDernierBloc).digest("hex");
    } else {
        // Premier bloc de la blockchain
        nouveauBloc.hash = hash.update("genesis").digest("hex");
    }

    let nouveauxBlocs = [
        ...blocs,
        nouveauBloc
    ];

    return writeFile(path + "blockchain.json", JSON.stringify(nouveauxBlocs, null, 2), "utf-8")
        .then(() => nouveauBloc);
}

