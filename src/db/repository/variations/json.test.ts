import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JsonRepo } from './json';
import { JsonOrmFactory } from '@blazyts/json-orm';
import type { Song } from '../../types';

// Mock the JsonOrmFactory
vi.mock('@blazyts/json-orm', () => ({
    JsonOrmFactory: {
        normal: vi.fn()
    },
    JsonOrm: vi.fn()
}));

describe('JsonRepo', () => {
    let jsonRepo: JsonRepo;
    let mockClient: any;

    const mockSongs: Song[] = [
        {
            name: 'Song One',
            author: 'Artist A',
            tags: [
                { type: 'genre', value: 'rock' },
                { type: 'mood', value: 'energetic' }
            ],
            audioHash: 'hash_1'
        },
        {
            name: 'Song Two',
            author: 'Artist B',
            tags: [
                { type: 'genre', value: 'pop' },
                { type: 'mood', value: 'calm' }
            ],
            audioHash: 'hash_2'
        },
        {
            name: 'Another Song',
            author: 'Artist A',
            tags: [
                { type: 'genre', value: 'rock' },
                { type: 'mood', value: 'calm' }
            ],
            audioHash: 'hash_3'
        },
        {
            name: 'Test Song',
            author: 'Artist C',
            tags: [
                { type: 'genre', value: 'jazz' }
            ],
            audioHash: 'hash_4'
        }
    ];

    beforeEach(() => {
        mockClient = {
            transact: vi.fn(async (fn) => {
                const proxy = {
                    songs: {
                        push: vi.fn()
                    }
                };
                fn(proxy);
            }),
            getContent: vi.fn(async () => ({
                songs: [...mockSongs]
            })),
            songs: {
                findMany: vi.fn(async () => [...mockSongs])
            }
        };

        (JsonOrmFactory.normal as any).mockReturnValue(mockClient);
        jsonRepo = new JsonRepo();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('createSong', () => {
        it('should create a song with a generated audioHash', async () => {
            const newSong = {
                name: 'New Song',
                author: 'New Artist',
                tags: [{ type: 'genre', value: 'electronic' }]
            };

            await jsonRepo.createSong(newSong);

            expect(mockClient.transact).toHaveBeenCalledTimes(1);
            const transactCallback = mockClient.transact.mock.calls[0][0];
            const mockProxy = {
                songs: {
                    push: vi.fn()
                }
            };
            transactCallback(mockProxy);

            expect(mockProxy.songs.push).toHaveBeenCalledTimes(1);
            const pushedSong = mockProxy.songs.push.mock.calls[0][0];
            expect(pushedSong).toMatchObject(newSong);
            expect(pushedSong.audioHash).toMatch(/^hash_\d+_[a-z0-9]+$/);
        });
    });

    describe('get', () => {
        it('should filter songs by exact name match', async () => {
            const result = await jsonRepo.get({
                name: { is: 'Song One' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Song One');
        });

        it('should filter songs by name contains', async () => {
            const result = await jsonRepo.get({
                name: { contains: 'Song' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(2);
            expect(result.every(song => song.name.includes('Song'))).toBe(true);
        });

        it('should filter songs by author', async () => {
            const result = await jsonRepo.get({
                author: 'Artist A'
            });

            expect(result).toHaveLength(2);
            expect(result.every(song => song.author === 'Artist A')).toBe(true);
        });

        it('should filter songs by tag type', async () => {
            const result = await jsonRepo.get({
                tags: { hasTagOfType: 'mood' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(2);
            expect(result.every(song => song.tags.some(tag => tag.type === 'mood'))).toBe(true);
        });

        it('should filter songs by tag value', async () => {
            const result = await jsonRepo.get({
                tags: { valueOfTagIs: 'rock' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(2);
            expect(result.every(song => song.tags.some(tag => tag.value === 'rock'))).toBe(true);
        });

        it('should apply multiple filters (name, tags, author)', async () => {
            const result = await jsonRepo.get({
                name: { contains: 'Song' },
                tags: { hasTagOfType: 'mood', valueOfTagIs: 'calm' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Another Song');
            expect(result[0].author).toBe('Artist A');
        });

        it('should return empty array when no songs match filters', async () => {
            const result = await jsonRepo.get({
                name: { is: 'Nonexistent Song' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(0);
        });

        it('should throw error when both "is" and "contains" are provided', async () => {
            const query: any = {
                name: { is: 'Song One', contains: 'Song' },
                author: 'Artist A'
            };

            await expect(jsonRepo.get(query)).rejects.toThrow(
                'cant use both params // make it into a result into the future'
            );
        });

        it('should return all songs for an author when no other filters applied', async () => {
            const result = await jsonRepo.get({
                author: 'Artist B'
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Song Two');
        });

        it('should handle filtering with only tag type', async () => {
            const result = await jsonRepo.get({
                tags: { hasTagOfType: 'genre' },
                author: 'Artist A'
            });

            expect(result).toHaveLength(2);
        });

        it('should handle filtering with only tag value', async () => {
            const result = await jsonRepo.get({
                tags: { valueOfTagIs: 'jazz' },
                author: 'Artist C'
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Test Song');
        });
    });

    describe('getAll', () => {
        it('should return all songs', async () => {
            const result = await jsonRepo.getAll();

            expect(result).toHaveLength(mockSongs.length);
            expect(result).toEqual(mockSongs);
            expect(mockClient.getContent).toHaveBeenCalledTimes(1);
        });
    });

    describe('getUsingAi', () => {
        it('should throw an error indicating AI retrieval is not implemented', () => {
            expect(() => jsonRepo.getUsingAi('Find me some rock songs')).toThrow(
                'AI-based song retrieval not implemented. Consider integrating an AI service.'
            );
        });
    });

    describe('generateAudioHash (private method)', () => {
        it('should generate unique hashes for different songs', async () => {
            const song1 = {
                name: 'Song 1',
                author: 'Artist',
                tags: []
            };
            const song2 = {
                name: 'Song 2',
                author: 'Artist',
                tags: []
            };

            await jsonRepo.createSong(song1);
            await jsonRepo.createSong(song2);

            const calls = mockClient.transact.mock.calls;
            const mockProxy1 = { songs: { push: vi.fn() } };
            const mockProxy2 = { songs: { push: vi.fn() } };

            calls[0][0](mockProxy1);
            calls[1][0](mockProxy2);

            const hash1 = mockProxy1.songs.push.mock.calls[0][0].audioHash;
            const hash2 = mockProxy2.songs.push.mock.calls[0][0].audioHash;

            expect(hash1).not.toBe(hash2);
            expect(hash1).toMatch(/^hash_\d+_[a-z0-9]+$/);
            expect(hash2).toMatch(/^hash_\d+_[a-z0-9]+$/);
        });
    });
});
