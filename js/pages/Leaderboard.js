import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,

     data: () => ({
        loading: true,
        leaderboard: [],
        err: [],
        notFound: undefined,
        selected: 0,
        store,
        searchQuery: '',
        copied: false,
        selectedNation: null,
        flags: {}
    }),

    methods: {
        localize,
        rgbaBind,
        packColor,
        copyURL,
        selectFromParam() {
            if (this.$route.params.user) {
                const returnedIndex = this.leaderboard.findIndex(
                    (entry) => 
                        entry.user.toLowerCase().replaceAll(" ", "_") === this.$route.params.user.toLowerCase()
                );
                if (returnedIndex !== -1) this.selected = returnedIndex;
                else {
                    this.notFound = this.$route.params.user;
                    console.log(this.notFound)
                }
            }
        },
        scrollToSelected() {
            this.$nextTick(() => {
                const selectedElement = this.$refs.selected;
                if (selectedElement && selectedElement[0] && selectedElement[0].firstChild) {
                    selectedElement[selectedElement.length - 1].firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    },

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },

        filteredLeaderboard() {
            const query = this.searchQuery.toLowerCase().replace(/\s/g, '');
    
            // Map each entry with its original index and filter based on the user name
            return this.leaderboard
                .map((entry, index) => ({ index, entry }))
                .filter(({ entry }) =>
                    (this.searchQuery.trim() ? entry.user.toLowerCase().includes(query) : true) &&
                    (this.selectedNation ? entry.flag === this.selectedNation : true)
                );
        },
    },

    async mounted() {
        // Fetch leaderboard and errors from store
        const [leaderboard, err] = this.store.leaderboard;
        this.leaderboard = leaderboard;
        this.err = err;

        this.flags = await fetch("../../data/_flags.json")
            .then(async (res) => await res.json())
        this.flagMap = await fetch("../../data/_flagMap.json")
            .then(async (res) => await res.json())
        
        var ret = {};
        for (var key in this.flagMap) {
            ret[this.flagMap[key]] = key;
        }

        this.flagMap = Object.fromEntries(
            Object.entries(ret).filter(([key, value]) => Object.values(this.flags).includes(key))
        );
        
        this.selectFromParam()

        // Hide loading spinner
        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.leaderboard = updated.leaderboard[0]
                this.err = updated.errors
                this.selectFromParam()
            }, 
            deep: true
        }
    },
};
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        localize,
    },
};
