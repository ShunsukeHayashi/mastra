
"""
Test script for the DX Proposal Slack Bot

This script tests the Slack bot's functionality without requiring actual Slack credentials.
It simulates the Slack API calls and verifies that the bot correctly interacts with the DX Proposal API.
"""

import os
import sys
import json
import logging
from pathlib import Path
import requests
from unittest.mock import MagicMock, patch

os.environ["SLACK_BOT_TOKEN"] = "xoxb-test-token"
os.environ["SLACK_SIGNING_SECRET"] = "test-signing-secret"
os.environ["SLACK_APP_TOKEN"] = "xapp-test-token"
os.environ["API_BASE_URL"] = "http://localhost:4111/api"

with patch('slack_bolt.App'):
    sys.path.append(str(Path(__file__).parent.parent.parent))
    from dx_proposal_bot import (
        is_valid_url,
        generate_dx_proposal,
        check_proposal_status,
        download_proposal_pdf,
        format_full_proposal_blocks
    )

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TEST_COMPANY_URL = "https://www.toyota.co.jp"
TEST_WORKFLOW_ID = "dx-proposal-test-123456"
TEST_COMPANY_NAME = "Toyota"

def test_is_valid_url():
    """Test the URL validation function"""
    valid_urls = [
        "https://www.toyota.co.jp",
        "http://example.jp",
        "https://example.com",
        "https://example.net",
        "https://example.org"
    ]
    
    invalid_urls = [
        "not-a-url",
        "ftp://example.com",
        "www.example.com"  # Missing protocol
    ]
    
    for url in valid_urls:
        assert is_valid_url(url), f"URL should be valid: {url}"
    
    for url in invalid_urls:
        assert not is_valid_url(url), f"URL should be invalid: {url}"
    
    logger.info("✅ URL validation tests passed")

@patch('requests.post')
def test_generate_dx_proposal(mock_post):
    """Test the generate_dx_proposal function"""
    mock_response = MagicMock()
    mock_response.status_code = 202
    mock_response.json.return_value = {
        "workflowId": TEST_WORKFLOW_ID,
        "estimatedCompletionTime": "2-3分"
    }
    mock_post.return_value = mock_response
    
    workflow_id, estimated_time = generate_dx_proposal(TEST_COMPANY_URL)
    
    assert workflow_id == TEST_WORKFLOW_ID
    assert estimated_time == "2-3分"
    
    mock_post.assert_called_once()
    args, kwargs = mock_post.call_args
    assert "dx-proposal" in args[0]
    assert kwargs["json"]["companyUrl"] == TEST_COMPANY_URL
    
    logger.info("✅ generate_dx_proposal tests passed")

@patch('requests.get')
def test_check_proposal_status(mock_get):
    """Test the check_proposal_status function"""
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "status": "completed",
        "result": {
            "proposal": {
                "companyInfo": {
                    "name": TEST_COMPANY_NAME,
                    "industry": "自動車製造業"
                },
                "executiveSummary": "テスト用エグゼクティブサマリー",
                "opportunities": [
                    {
                        "title": "デジタル製造",
                        "description": "製造プロセスのデジタル化"
                    }
                ]
            }
        }
    }
    mock_get.return_value = mock_response
    
    result = check_proposal_status(TEST_WORKFLOW_ID)
    
    assert result["status"] == "completed"
    assert result["result"]["proposal"]["companyInfo"]["name"] == TEST_COMPANY_NAME
    
    mock_get.assert_called_once()
    args, kwargs = mock_get.call_args
    assert TEST_WORKFLOW_ID in args[0]
    
    logger.info("✅ check_proposal_status tests passed")

@patch('requests.get')
def test_download_proposal_pdf(mock_get):
    """Test the download_proposal_pdf function"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.iter_content.return_value = [b"PDF content"]
    mock_get.return_value = mock_response
    
    with patch('builtins.open', MagicMock()):
        pdf_path = download_proposal_pdf(TEST_WORKFLOW_ID, TEST_COMPANY_NAME)
    
    assert pdf_path is not None
    assert TEST_COMPANY_NAME.lower() in str(pdf_path).lower()
    
    mock_get.assert_called_once()
    args, kwargs = mock_get.call_args
    assert TEST_WORKFLOW_ID in args[0]
    assert "pdf" in args[0]
    
    logger.info("✅ download_proposal_pdf tests passed")

def test_format_full_proposal_blocks():
    """Test the format_full_proposal_blocks function"""
    proposal = {
        "companyInfo": {
            "name": TEST_COMPANY_NAME,
            "industry": "自動車製造業",
            "description": "自動車メーカー"
        },
        "executiveSummary": "テスト用エグゼクティブサマリー",
        "businessChallenges": [
            "グローバル競争",
            "電動化への移行"
        ],
        "opportunities": [
            {
                "title": "デジタル製造",
                "description": "製造プロセスのデジタル化",
                "benefits": ["コスト削減", "品質向上"]
            }
        ],
        "implementationRoadmap": [
            {
                "phase": "フェーズ1",
                "timeline": "3ヶ月",
                "tasks": ["要件定義", "設計"]
            }
        ],
        "investmentSummary": {
            "totalCost": "1億円",
            "roi": "200%",
            "paybackPeriod": "2年"
        },
        "conclusion": "まとめ"
    }
    
    blocks = format_full_proposal_blocks(proposal)
    
    assert len(blocks) > 0
    assert any(TEST_COMPANY_NAME in str(block) for block in blocks)
    assert any("自動車製造業" in str(block) for block in blocks)
    assert any("テスト用エグゼクティブサマリー" in str(block) for block in blocks)
    assert any("デジタル製造" in str(block) for block in blocks)
    assert any("フェーズ1" in str(block) for block in blocks)
    assert any("1億円" in str(block) for block in blocks)
    assert any("まとめ" in str(block) for block in blocks)
    
    logger.info("✅ format_full_proposal_blocks tests passed")

def run_all_tests():
    """Run all tests"""
    logger.info("🧪 Running Slack bot tests...")
    
    test_is_valid_url()
    test_generate_dx_proposal()
    test_check_proposal_status()
    test_download_proposal_pdf()
    test_format_full_proposal_blocks()
    
    logger.info("✅ All tests passed!")

if __name__ == "__main__":
    os.environ["API_BASE_URL"] = "http://localhost:4111/api"
    
    run_all_tests()
