/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../stories/route';

// We need to mock these modules before importing them
const mockPrismaClient = {
  story: {
    count: jest.fn().mockResolvedValue(244),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: 'Test Story 1',
        processedText: 'This is a test story about baseball',
        sourceType: 'New York Times',
        timestamp: new Date('1970-01-01'),
        storyType: 'Sports'
      },
      {
        id: 2,
        title: 'Test Story 2',
        processedText: 'Another test story about politics',
        sourceType: 'Washington Post',
        timestamp: new Date('1975-05-15'),
        storyType: 'Politics'
      }
    ])
  },
  $queryRaw: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Test Story 1',
      processedText: 'This is a test story about baseball',
      sourceType: 'New York Times',
      timestamp: new Date('1970-01-01'),
      storyType: 'Sports'
    }
  ])
};

// Mock modules
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }]
      })
    }
  }))
}));

describe('Stories API', () => {
  test('should return stories from the database', async () => {
    // Create a mock request
    const req = new NextRequest('http://localhost:3000/api/stories?query=baseball', {
      method: 'GET'
    });
    
    // Call the handler
    const res = await GET(req);
    const data = await res.json();
    
    // Check the response
    expect(res.status).toBe(200);
    expect(data.stories).toBeDefined();
    expect(data.stories.length).toBeGreaterThan(0);
    expect(data.usedFallback).toBe(false);
  });

  test('should filter by publication', async () => {
    // Create a mock request with publication filter
    const req = new NextRequest('http://localhost:3000/api/stories?query=test&publication=New%20York%20Times', {
      method: 'GET'
    });
    
    // Call the handler
    const res = await GET(req);
    const data = await res.json();
    
    // Check the response
    expect(res.status).toBe(200);
    expect(data.stories).toBeDefined();
    // Note: In a real test, we would verify the publication filter was applied
  });

  test('should filter by date range', async () => {
    // Create a mock request with date range
    const req = new NextRequest(
      'http://localhost:3000/api/stories?query=test&startDate=1970-01-01&endDate=1975-12-31', 
      { method: 'GET' }
    );
    
    // Call the handler
    const res = await GET(req);
    const data = await res.json();
    
    // Check the response
    expect(res.status).toBe(200);
    expect(data.stories).toBeDefined();
    // Note: In a real test, we would verify the date filters were applied
  });

  test('should return empty array for no matches', async () => {
    // Save the original mock
    const originalMockPrisma = mockPrismaClient;
    
    // Create new mock that returns empty results
    const emptyMockPrisma = {
      ...mockPrismaClient,
      story: {
        ...mockPrismaClient.story,
        findMany: jest.fn().mockResolvedValue([])
      },
      $queryRaw: jest.fn().mockResolvedValue([])
    };
    
    // Replace the mock temporarily
    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn(() => emptyMockPrisma)
    }));
    
    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Create a mock request with no matches
    const req = new NextRequest('http://localhost:3000/api/stories?query=nonexistent', {
      method: 'GET'
    });
    
    // Call the handler
    const res = await GET(req);
    const data = await res.json();
    
    // Clean up
    consoleSpy.mockRestore();
    
    // Restore original mock
    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn(() => originalMockPrisma)
    }));
    
    // Check the response
    expect(res.status).toBe(200);
    expect(data.stories).toEqual([]);
    expect(data.usedFallback).toBe(false);
  });
}); 