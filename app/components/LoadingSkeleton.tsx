'use client';

export default function LoadingSkeleton() {
    return (
        <div className="relative min-h-screen bg-gray-700 bg-[url('/assets/bg2.jpg')] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col">
            {/* Overlay semi-transparent pour assombrir l'image de fond */}
            <div className="absolute inset-0 bg-gray-900/70 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col flex-1">
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

                <div className="flex-1 flex flex-col justify-center max-w-full px-4 py-2">
                    <div className="w-full flex flex-col justify-center ">
                        {/* RunDetailsPanel Skeleton - exactement comme RunDetailsPanel */}
                        <div className="w-full md:w-fit rounded-2xl bg-gray-900 mb-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center h-90 xs:h-82 lg:h-40 xl:h-50 px-4 py-3 gap-4">
                                {/* Ligne du haut sur très petits écrans: Stats + Badges */}
                                <div className="flex flex-row items-start h-full w-full sm:w-auto gap-3 sm:gap-4">
                                    {/* Colonne gauche: Stats - exactement comme RunStats */}
                                    <div className="shrink-0 h-full text-gray-300">
                                        <div className="flex flex-col justify-between lg:justify-center gap-1.5 h-full">
                                            {/* Ligne 1 : 4 colonnes - Run #, Alive, Battles, Deaths */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-1.5 items-stretch h-full">
                                                {/* Run # - exactement comme le vrai */}
                                                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5 h-full">
                                                    <div className="h-5 w-20 bg-gray-600/70 rounded animate-pulse" />
                                                </div>
                                                {/* Alive - exactement comme le vrai */}
                                                <div className="bg-gray-700/50 rounded-lg px-3 py-1.5 w-full text-center flex flex-col justify-center h-full">
                                                    <div className="h-6 w-12 bg-gray-600/70 rounded mx-auto mb-1 animate-pulse" />
                                                    <div className="h-3 w-10 bg-gray-600/70 rounded mx-auto animate-pulse" />
                                                </div>
                                                {/* Battles - exactement comme le vrai */}
                                                <div className="bg-gray-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2 h-full">
                                                    <div className="flex-1">
                                                        <div className="h-3 w-12 bg-gray-600/70 rounded mb-1 animate-pulse" />
                                                        <div className="h-5 w-16 bg-gray-600/70 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                                {/* Deaths - exactement comme le vrai */}
                                                <div className="bg-gray-700/50 rounded-lg px-3 py-1.5 text-center flex flex-col justify-center h-full">
                                                    <div className="h-6 w-8 bg-gray-600/70 rounded mx-auto mb-1 animate-pulse" />
                                                    <div className="h-3 w-12 bg-gray-600/70 rounded mx-auto animate-pulse" />
                                                </div>
                                            </div>
                                            {/* Ligne 2 : 2 colonnes - Start, End */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-1.5 lg:gap-x-2 items-stretch h-full">
                                                {/* Start - exactement comme le vrai */}
                                                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 h-full">
                                                    <div className="flex-1">
                                                        <div className="h-3 w-10 bg-gray-700/50 rounded mb-1 animate-pulse" />
                                                        <div className="h-5 w-20 bg-gray-700/50 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                                {/* End - exactement comme le vrai */}
                                                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 h-full">
                                                    <div className="flex-1">
                                                        <div className="h-3 w-8 bg-gray-700/50 rounded mb-1 animate-pulse" />
                                                        <div className="h-5 w-20 bg-gray-700/50 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges à droite sur très petits écrans, puis en dessous sur sm+ */}
                                    <div className="sm:hidden">
                                        {/* BadgesGrid Skeleton - grille 2x3 */}
                                        <div className="w-[100px]">
                                            <div className="grid grid-cols-2 gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                    (i) => (
                                                        <div
                                                            key={i}
                                                            className="w-12 h-12 rounded bg-white/10 animate-pulse"
                                                            style={{
                                                                animationDelay: `${
                                                                    i * 0.1
                                                                }s`,
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite sur sm+: Trainer + Showcase et Badges empilés en colonne, puis en ligne à partir de lg */}
                                <div className="hidden sm:flex flex-col h-full lg:flex-row gap-4">
                                    {/* TrainerShowcase Skeleton */}
                                    <div className="h-full max-w-full sm:max-w-[290px] lg:max-w-none flex flex-col justify-center bg-white/10 rounded-lg px-2 sm:px-3 py-2 sm:py-3">
                                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-700/50 rounded mb-1.5 sm:mb-2 md:mb-0 animate-pulse" />
                                        <div className="flex items-center h-full gap-1.5 sm:gap-2">
                                            {/* Trainer sprite */}
                                            <div className="h-20 w-20 sm:h-[96px] sm:w-[96px] xl:h-[128px] xl:w-[128px] rounded bg-white/10 animate-pulse shrink-0" />
                                            {/* Showcase pokemon - 2 lignes de 3 */}
                                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                                <div className="flex gap-1.5 sm:gap-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-10 w-10 sm:h-12 sm:w-12 xl:h-16 xl:w-16 rounded bg-white/10 animate-pulse shrink-0"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex gap-1.5 sm:gap-2">
                                                    {[4, 5, 6].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-10 w-10 sm:h-12 sm:w-12 xl:h-16 xl:w-16 rounded bg-white/10 animate-pulse shrink-0"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BadgesGrid Skeleton - exactement comme BadgesGrid */}
                                    <div className="w-[100px] sm:w-[268px] xl:w-[344px] h-full">
                                        <div className="grid grid-cols-2 gap-1 sm:grid sm:grid-cols-4 sm:gap-1.5 md:gap-1.5 xl:gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                (i) => (
                                                    <div
                                                        key={i}
                                                        className="w-12 h-12 sm:w-[64px] sm:h-[64px] xl:w-20 xl:h-20 rounded bg-white/10 animate-pulse"
                                                        style={{
                                                            animationDelay: `${
                                                                i * 0.1
                                                            }s`,
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* TrainerShowcase en dessous sur très petits écrans */}
                                <div className="w-full sm:hidden">
                                    <div className="h-full max-w-full flex flex-col justify-center bg-white/10 rounded-lg px-2 py-2">
                                        <div className="h-3 w-24 bg-gray-700/50 rounded mb-1.5 animate-pulse" />
                                        <div className="flex items-center h-full gap-1.5">
                                            {/* Trainer sprite */}
                                            <div className="h-20 w-20 rounded bg-white/10 animate-pulse shrink-0" />
                                            {/* Showcase pokemon - 2 lignes de 3 */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex gap-1.5">
                                                    {[1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-10 w-10 rounded bg-white/10 animate-pulse shrink-0"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {[4, 5, 6].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-10 w-10 rounded bg-white/10 animate-pulse shrink-0"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pokemon Cards Skeleton - scroll horizontal */}
                        <div className="w-full overflow-x-auto pb-4">
                            <div className="inline-flex gap-4 sm:gap-7 min-w-max">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="relative min-w-[140px] sm:min-w-[170px] lg:min-w-[280px] flex flex-col items-center">
                                        <div className="relative w-full overflow-hidden rounded-2xl pb-3 sm:pb-4 bg-gray-900 shadow-xl">
                                            {/* Location header */}
                                            <div className="h-6 sm:h-8 bg-gray-700/50 mb-2 sm:mb-4 animate-pulse" />

                                            {/* Image et Infos principales côte à côte */}
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-3 sm:px-4">
                                                {/* Image */}
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-700/50 rounded-2xl shrink-0 animate-pulse" />

                                                {/* Infos à droite */}
                                                <div className="flex-1">
                                                    <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-700/50 rounded mb-1.5 sm:mb-2 animate-pulse" />
                                                    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-700/50 rounded mb-1.5 sm:mb-2 animate-pulse" />
                                                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-700/50 rounded animate-pulse" />
                                                </div>
                                            </div>

                                            {/* Moves en grille 2x2 */}
                                            <div className="bg-gray-800 mx-3 sm:mx-4 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                                <div className="hidden lg:block h-4 w-16 bg-gray-700/50 rounded mb-2 mx-auto animate-pulse" />
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                                                    {[1, 2, 3, 4].map((j) => (
                                                        <div
                                                            key={j}
                                                            className="h-6 sm:h-7 bg-gray-700/50 rounded animate-pulse"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Radar Chart placeholder */}
                                            <div className="mx-3 sm:mx-4 mb-2 sm:mb-3">
                                                <div className="h-32 sm:h-40 w-full bg-gray-700/30 rounded-lg animate-pulse scale-90 sm:scale-100" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
