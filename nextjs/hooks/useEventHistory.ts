import { getAccount } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { AbiEvent } from "viem";
import { usePublicClient } from "wagmi";
import { contracts } from "../contracts/contract";
import { wagmiConfig } from "../services/web3/wagmiConfig";

export type EventHistoryProps = {
    contractName: string;
    eventName: string;
    fromBlock: bigint;
};

export const useEventHistory = ({
    contractName,
    eventName,
    fromBlock,
}: EventHistoryProps) => {
    const [events, setEvents] = useState<any[]>([]);
    const [fromBlockUpdated, setFromBlockUpdated] = useState<bigint>(BigInt(0));
    const { chainId } = getAccount(wagmiConfig);
    const publicClient = usePublicClient({
        chainId: chainId,
    });
    const contract = contracts?.[chainId!]?.[contractName];
    const event = contract?.abi?.find(
        (part) => part.type === "event" && part.name === eventName
    ) as AbiEvent;
    const contractAddress = contract?.address;

    const readEvents = useCallback(async () => {
        if (!event) {
            throw new Error("Event not found");
        }

        if (!publicClient) {
            throw new Error("Public client not found");
        }
        const blockNumber = await publicClient.getBlockNumber({ cacheTime: 0 });
        if (blockNumber >= fromBlockUpdated) {
            const logs = await publicClient.getLogs({
                address: contractAddress,
                event: event,
                fromBlock: fromBlockUpdated,
                toBlock: blockNumber,
            });
            setFromBlockUpdated(blockNumber + 1n);
            const newEvents = [];
            for (let i = logs.length - 1; i >= 0; i--) {
                newEvents.push({
                    log: logs[i],
                    args: logs[i].args,
                });
            }
            setEvents(newEvents);
        }
    }, [fromBlockUpdated, publicClient, contractAddress, event]);

    useEffect(() => {
        if (contract) {
            readEvents();
        }
    }, [readEvents, contract]);

    useEffect(() => {
        // Reset the internal state when target network or fromBlock changed
        setEvents([]);
        setFromBlockUpdated(fromBlock);
    }, [fromBlock, chainId]);

    return {
        data: events,
    };
};
