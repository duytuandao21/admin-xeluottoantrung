import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attemptSave, may, milestoneProblem, sectionProblem, storyProblem } from '../src/lib/about-story-rules.ts';

const chapters = ['opening','milestones','stories','people','future'].map(chapterKey => ({chapterKey,title:chapterKey,visible:true,ctaHref:null,ctaLabel:null}));
const milestone = {id:'m1',slug:'1997-khoi-dau',periodLabel:'1997',title:'Khởi đầu',summary:'Bắt đầu hành trình',publishStatus:'published',verificationStatus:'verified',sourceNote:'Nguồn đã đối chiếu'};
const story = {id:'s1',title:'Khách hàng thật',body:'Nội dung thực tế',publishStatus:'published',consentStatus:'granted',consentReference:'Hồ sơ nội bộ'};
test('permissions are exact and missing identity cannot read or edit', () => {
  assert.equal(may(undefined,'content.read'),false);
  assert.equal(may(['content.read'],'content.update'),false);
  assert.equal(may(['content.update'],'content.update'),true);
});

test('editing needs complete content and valid internal CTA, without approval workflow', () => {
  assert.equal(milestoneProblem({...milestone,sourceNote:null,verificationStatus:'needs_review'}),null);
  assert.equal(storyProblem({...story,consentReference:null,consentStatus:'missing'}),null);
  assert.equal(milestoneProblem({...milestone,summary:''}) !== null,true);
  assert.equal(storyProblem({...story,body:''}) !== null,true);
  assert.equal(sectionProblem({...chapters[0],ctaLabel:'Link',ctaHref:null}) !== null,true);
  assert.equal(sectionProblem({...chapters[0],ctaLabel:'Link',ctaHref:'https://example.com'}) !== null,true);
  assert.equal(sectionProblem({...chapters[0],ctaLabel:'Link',ctaHref:'/san-pham'}),null);
});

test('failed API write never runs success path that clears the local form', async () => {
  const form = {title:'Nội dung chưa lưu'};
  let clearCount = 0;
  const result = await attemptSave(async () => { throw new Error('409 conflict'); });
  if (result.ok) clearCount++;
  assert.equal(result.ok,false);
  assert.equal(clearCount,0);
  assert.equal(form.title,'Nội dung chưa lưu');
});
