import { decodeHex } from 'metashrew-as/assembly/utils/hex';
import { Box } from 'metashrew-as/assembly/utils/box';
import { Input } from 'metashrew-as/assembly/blockdata/transaction'
import { Witness } from 'metashrew-as/assembly/blockdata/witness'


export const TEST_BTC_TX_1_HEIGHT = 853768;
export const TEST_BTC_INPUT_1 = 
{
    hash: Box.from(decodeHex('')),
    index: 0,
    script: Box.from(decodeHex('76a914f4b9f0f3fcedd4e4f1c7f1e3f0f0f0f0f0f0f0f088ac')),
    sequence: 4294967295,
    witness: new Witness(Box.from(decodeHex('000'))),

};
export const TEST_BTC_INPUT_2 =  {
    index: 1,
    script: '76a914f4b9f0f3fcedd4e4f1c7f1e3f0f0f0f0f0f0f0f088ac',
    sequence: 4294967295,
    witness: '',
};
