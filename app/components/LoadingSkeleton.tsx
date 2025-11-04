'use client';

export default function LoadingSkeleton() {
    return (
        <div className="relative min-h-screen bg-gray-700">
            {/* Header Skeleton */}
            <header className="flex justify-between items-center py-4 lg:py-0 sticky top-0 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-black/20 backdrop-blur-sm z-50">
                {/* Logo/Titre */}
                <div className="h-8 lg:h-10 xl:h-12 w-48 lg:w-64 xl:w-80 bg-gray-600/50 rounded-lg animate-pulse" />

                {/* Mobile menu */}
                <div className="lg:hidden flex items-center gap-2">
                    <div className="h-10 w-10 bg-gray-600/50 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-gray-600/50 rounded-lg animate-pulse" />
                    <div className="h-10 w-10 bg-gray-600/50 rounded-lg animate-pulse" />
                </div>

                {/* Desktop menu - scroll horizontal de runs */}
                <div className="hidden lg:flex justify-center overflow-x-scroll overflow-y-hidden items-center max-w-[70%]">
                    <div className="h-6 w-20 bg-gray-600/50 rounded animate-pulse" />
                    <div className="flex overflow-x-scroll overflow-y-hidden p-2 m-2 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="h-10 w-10 bg-gray-600/50 rounded-lg animate-pulse shrink-0"
                                style={{
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-full px-4 py-2">
                {/* RunDetailsPanel Skeleton - exactement comme RunDetailsPanel */}
                <div className="w-fit rounded-2xl bg-gray-900 mb-4">
                    <div className="flex flex-row items-center h-fit lg:h-40 xl:h-50 p-4 gap-4">
                        {/* Colonne gauche: Stats - exactement comme RunStats */}
                        <div className="shrink-0 h-full text-gray-300">
                            <div className="flex flex-col justify-between lg:justify-center gap-2 h-full">
                                {/* Ligne 1 : 4 colonnes - Run #, Alive, Battles, Deaths */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-2 items-stretch h-full">
                                    {/* Run # - exactement comme le vrai */}
                                    <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 h-full">
                                        <div className="h-5 w-20 bg-gray-600/70 rounded animate-pulse" />
                                    </div>
                                    {/* Alive - exactement comme le vrai */}
                                    <div className="bg-gray-700/50 rounded-lg p-3 w-full text-center flex flex-col justify-center h-full">
                                        <div className="h-6 w-12 bg-gray-600/70 rounded mx-auto mb-1 animate-pulse" />
                                        <div className="h-3 w-10 bg-gray-600/70 rounded mx-auto animate-pulse" />
                                    </div>
                                    {/* Battles - exactement comme le vrai */}
                                    <div className="bg-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                                        <div className="flex-1">
                                            <div className="h-3 w-12 bg-gray-600/70 rounded mb-1 animate-pulse" />
                                            <div className="h-5 w-16 bg-gray-600/70 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    {/* Deaths - exactement comme le vrai */}
                                    <div className="bg-gray-700/50 rounded-lg p-3 text-center flex flex-col justify-center h-full">
                                        <div className="h-6 w-8 bg-gray-600/70 rounded mx-auto mb-1 animate-pulse" />
                                        <div className="h-3 w-12 bg-gray-600/70 rounded mx-auto animate-pulse" />
                                    </div>
                                </div>
                                {/* Ligne 2 : 2 colonnes - Start, End */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 lg:gap-x-2 items-stretch h-full">
                                    {/* Start - exactement comme le vrai */}
                                    <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                                        <div className="flex-1">
                                            <div className="h-3 w-10 bg-gray-700/50 rounded mb-1 animate-pulse" />
                                            <div className="h-5 w-20 bg-gray-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    {/* End - exactement comme le vrai */}
                                    <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                                        <div className="flex-1">
                                            <div className="h-3 w-8 bg-gray-700/50 rounded mb-1 animate-pulse" />
                                            <div className="h-5 w-20 bg-gray-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite: Trainer + Showcase et Badges empilés en colonne, puis en ligne à partir de lg */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* TrainerShowcase Skeleton */}
                            <div className="h-full max-w-[264px] lg:max-w-none flex flex-col justify-center bg-white/10 rounded-lg px-3 py-3">
                                <div className="h-4 w-32 bg-gray-700/50 rounded mb-2 animate-pulse" />
                                <div className="flex items-center h-full gap-2">
                                    {/* Trainer sprite */}
                                    <div className="h-22 w-22 xl:h-30 xl:w-30 rounded bg-white/10 animate-pulse shrink-0" />
                                    {/* Showcase pokemon - 2 lignes de 3 */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-16 w-16 rounded bg-white/10 animate-pulse shrink-0"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            {[4, 5, 6].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-16 w-16 rounded bg-white/10 animate-pulse shrink-0"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BadgesGrid Skeleton - exactement comme BadgesGrid */}
                            <div className="w-[265px] xl:w-[344px] h-full">
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div
                                            key={i}
                                            className="w-15 h-15 xl:w-20 xl:h-20 rounded bg-white/10 animate-pulse"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pokemon Cards Skeleton - scroll horizontal */}
                <div className="overflow-x-auto pb-4">
                    <div className="inline-flex gap-4 min-w-max">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="relative min-w-[170px] lg:min-w-[280px] flex flex-col items-center">
                                <div className="relative w-full overflow-hidden rounded-2xl pb-4 bg-gray-900 shadow-xl">
                                    {/* Location header */}
                                    <div className="h-8 bg-gray-700/50 mb-4 animate-pulse" />

                                    {/* Image et Infos principales côte à côte */}
                                    <div className="flex items-center gap-3 mb-3 px-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-700/50 rounded-2xl shrink-0 animate-pulse" />

                                        {/* Infos à droite */}
                                        <div className="flex-1">
                                            <div className="h-5 w-32 bg-gray-700/50 rounded mb-2 animate-pulse" />
                                            <div className="h-4 w-24 bg-gray-700/50 rounded mb-2 animate-pulse" />
                                            <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Moves en grille 2x2 */}
                                    <div className="bg-gray-800 mx-4 rounded-lg p-3 mb-3">
                                        <div className="hidden lg:block h-4 w-16 bg-gray-700/50 rounded mb-2 mx-auto animate-pulse" />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                                            {[1, 2, 3, 4].map((j) => (
                                                <div
                                                    key={j}
                                                    className="h-7 bg-gray-700/50 rounded animate-pulse"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Radar Chart placeholder */}
                                    <div className="mx-4 mb-3">
                                        <div className="h-40 w-full bg-gray-700/30 rounded-lg animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

