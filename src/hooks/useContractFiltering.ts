import { useMemo, useState } from "react";
import type { Contracts } from "@/lib/types";

export function useContractFiltering(contracts: Contracts[]) {
    const [searchQuery, setSearchQuery] = useState("");

    // Memoize filtered contracts to prevent unnecessary recalculations
    const filteredContracts = useMemo(() => {
        return contracts.filter((c) =>
            c.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contracts, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return {
        searchQuery,
        filteredContracts,
        handleSearchChange,
    };
}
